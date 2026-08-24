from __future__ import annotations

import math
import random
import time
import uuid
from dataclasses import dataclass, field
from statistics import mean
from typing import Any

from llm_client import LocalLLMClient
from question_bank import CEFR_LEVELS, CEFR_TO_SCORE, QUESTION_BANK

DEFAULT_TOTAL_QUESTIONS = 36
MIN_QUESTIONS_BEFORE_EARLY_FINISH = 32


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def estimate_to_level(estimate: float) -> str:
    index = int(round(clamp(estimate, 1.0, 6.0))) - 1
    return CEFR_LEVELS[index]


def ability_band(estimate: float) -> str:
    rounded = int(round(clamp(estimate, 1.0, 6.0)))
    level = CEFR_LEVELS[rounded - 1]
    lower_gap = abs(estimate - max(1.0, rounded - 0.5))
    upper_gap = abs(estimate - min(6.0, rounded + 0.5))
    if lower_gap < 0.12 and rounded > 1:
        return f"{CEFR_LEVELS[rounded - 2]}/{level}"
    if upper_gap < 0.12 and rounded < 6:
        return f"{level}/{CEFR_LEVELS[rounded]}"
    return level


@dataclass
class SessionState:
    session_id: str
    started_at: float
    deadline_at: float
    total_questions: int = DEFAULT_TOTAL_QUESTIONS
    group_size: int = 3
    ability_estimate: float = 3.0
    current_group_target: int = 3
    current_question_id: str | None = None
    asked_question_ids: list[str] = field(default_factory=list)
    group_history: list[dict[str, Any]] = field(default_factory=list)
    history: list[dict[str, Any]] = field(default_factory=list)
    finished: bool = False
    final_result: dict[str, Any] | None = None

    @property
    def elapsed_seconds(self) -> int:
        return int(time.time() - self.started_at)

    @property
    def remaining_seconds(self) -> int:
        return max(0, int(self.deadline_at - time.time()))


class AdaptiveCEFREngine:
    def __init__(self, llm_client: LocalLLMClient | None = None) -> None:
        self._llm = llm_client or LocalLLMClient()
        self._question_by_id = {item["id"]: item for item in QUESTION_BANK}
        self._sessions: dict[str, SessionState] = {}

    def start_session(self, total_minutes: int = 20, total_questions: int = DEFAULT_TOTAL_QUESTIONS) -> dict[str, Any]:
        now = time.time()
        session = SessionState(
            session_id=str(uuid.uuid4()),
            started_at=now,
            deadline_at=now + total_minutes * 60,
            total_questions=total_questions,
            current_group_target=3,
            ability_estimate=3.0,
        )
        self._sessions[session.session_id] = session
        question = self._select_next_question(session)
        session.current_question_id = question["id"]
        return self._build_state_payload(session)

    def get_session(self, session_id: str) -> dict[str, Any]:
        session = self._sessions[session_id]
        if not session.finished and self._should_finish(session):
            self._finish_session(session)
        return self._build_state_payload(session)

    def submit_answer(self, session_id: str, choice_index: int) -> dict[str, Any]:
        session = self._sessions[session_id]
        if session.finished:
            return self._build_state_payload(session)

        if self._should_finish(session):
            self._finish_session(session)
            return self._build_state_payload(session)

        if session.current_question_id is None:
            raise ValueError("No active question for this session.")

        question = self._question_by_id[session.current_question_id]
        correct = int(choice_index) == int(question["answer"])
        expected = self._expected_probability(session.ability_estimate, float(question["difficulty"]))
        score = 1.0 if correct else 0.0
        k_factor = 0.9 + 0.08 * abs(float(question["difficulty"]) - session.ability_estimate)
        session.ability_estimate = clamp(session.ability_estimate + k_factor * (score - expected), 1.0, 6.0)

        record = {
            "question_id": question["id"],
            "cefr": question["cefr"],
            "difficulty": question["difficulty"],
            "skill": question["skill"],
            "question": question["question"],
            "selected_index": choice_index,
            "correct_index": question["answer"],
            "correct": correct,
            "expected": round(expected, 4),
            "estimate_after": round(session.ability_estimate, 4),
        }
        session.history.append(record)
        session.group_history.append(record)
        session.asked_question_ids.append(question["id"])
        session.current_question_id = None

        if self._should_finish(session):
            self._finish_session(session)
            return self._build_state_payload(session)

        if len(session.group_history) >= session.group_size:
            session.current_group_target = self._next_group_target(session)
            session.group_history.clear()

        next_question = self._select_next_question(session)
        session.current_question_id = next_question["id"]
        return self._build_state_payload(session)

    def _build_state_payload(self, session: SessionState) -> dict[str, Any]:
        if session.finished:
            return {
                "status": "finished",
                "session_id": session.session_id,
                "progress": self._progress_payload(session),
                "result": session.final_result,
            }

        question = self._question_by_id[session.current_question_id]
        return {
            "status": "in_progress",
            "session_id": session.session_id,
            "progress": self._progress_payload(session),
            "question": self._public_question_payload(question, session),
        }

    def _public_question_payload(self, question: dict[str, Any], session: SessionState) -> dict[str, Any]:
        return {
            "id": question["id"],
            "prompt": question["prompt"],
            "passage": question.get("passage"),
            "question": question["question"],
            "options": question["options"],
            "group_target": CEFR_LEVELS[session.current_group_target - 1],
        }

    def _progress_payload(self, session: SessionState) -> dict[str, Any]:
        answered = len(session.history)
        return {
            "answered": answered,
            "total_questions": session.total_questions,
            "group_size": session.group_size,
            "group_answered": answered % session.group_size,
            "remaining_seconds": session.remaining_seconds,
            "elapsed_seconds": session.elapsed_seconds,
            "estimated_band": ability_band(session.ability_estimate),
        }

    def _expected_probability(self, ability: float, difficulty: float) -> float:
        return 1.0 / (1.0 + math.exp(-(ability - difficulty) * 1.35))

    def _next_group_target(self, session: SessionState) -> int:
        recent = session.history[-session.group_size :]
        correct = sum(1 for item in recent if item["correct"])
        target = int(round(session.ability_estimate))
        if correct == session.group_size:
            target += 1
        elif correct <= 1:
            target -= 1
        return max(1, min(6, target))

    def _select_next_question(self, session: SessionState) -> dict[str, Any]:
        unused = [item for item in QUESTION_BANK if item["id"] not in set(session.asked_question_ids)]
        if not unused:
            raise RuntimeError("Question bank exhausted.")

        recent_skills = [item["skill"] for item in session.history[-2:]]
        random.Random(session.session_id + str(len(session.history))).shuffle(unused)

        def question_score(item: dict[str, Any]) -> tuple[float, float, float]:
            distance = abs(float(item["difficulty"]) - float(session.current_group_target))
            diversity_penalty = 0.35 if item["skill"] in recent_skills else 0.0
            estimate_bonus = abs(float(item["difficulty"]) - session.ability_estimate)
            return (distance + diversity_penalty, estimate_bonus, -float(item["difficulty"]))

        unused.sort(key=question_score)
        return unused[0]

    def _should_finish(self, session: SessionState) -> bool:
        answered = len(session.history)
        if answered >= session.total_questions:
            return True
        if session.remaining_seconds <= 0:
            return True
        # Preserve enough coverage across CEFR bands and skills before letting
        # a highly stable estimate finish a little ahead of the full 36 items.
        if answered >= MIN_QUESTIONS_BEFORE_EARLY_FINISH and self._confidence(session) >= 0.94:
            return True
        return False

    def _confidence(self, session: SessionState) -> float:
        if not session.history:
            return 0.2
        residual = mean(abs((1.0 if item["correct"] else 0.0) - item["expected"]) for item in session.history)
        quantity = min(0.3, len(session.history) * 0.02)
        stability = max(0.0, 0.5 - residual)
        return round(clamp(0.45 + quantity + stability, 0.2, 0.96), 2)

    def _strengths_and_gaps(self, session: SessionState) -> tuple[list[str], list[str]]:
        by_skill: dict[str, list[bool]] = {}
        by_level: dict[str, list[bool]] = {}
        for item in session.history:
            by_skill.setdefault(item["skill"], []).append(bool(item["correct"]))
            by_level.setdefault(item["cefr"], []).append(bool(item["correct"]))

        skill_scores = {skill: sum(values) / len(values) for skill, values in by_skill.items()}
        level_scores = {level: sum(values) / len(values) for level, values in by_level.items()}

        strengths: list[str] = []
        gaps: list[str] = []

        for skill, score in sorted(skill_scores.items(), key=lambda pair: pair[1], reverse=True):
            if score >= 0.7:
                strengths.append(f"{skill} correct rate {int(score * 100)}%")
        for level, score in sorted(level_scores.items(), key=lambda pair: pair[1]):
            if score < 0.5:
                gaps.append(f"{level} items correct rate {int(score * 100)}%")

        if not strengths:
            strengths.append("stable performance on easier items")
        if not gaps:
            gaps.append("borderline questions near the estimated level")
        return strengths[:3], gaps[:3]

    def _default_report(self, result: dict[str, Any]) -> str:
        strengths = "; ".join(result["strengths"])
        gaps = "; ".join(result["gaps"])
        return (
            f"Estimated CEFR: {result['cefr_level']} ({result['cefr_band']}). "
            f"Confidence: {result['confidence']}. "
            f"Strengths: {strengths}. "
            f"Needs work: {gaps}."
        )

    def _finish_session(self, session: SessionState) -> None:
        strengths, gaps = self._strengths_and_gaps(session)
        result = {
            "cefr_level": estimate_to_level(session.ability_estimate),
            "cefr_band": ability_band(session.ability_estimate),
            "ability_estimate": round(session.ability_estimate, 2),
            "confidence": self._confidence(session),
            "questions_answered": len(session.history),
            "minutes_used": round(session.elapsed_seconds / 60.0, 1),
            "strengths": strengths,
            "gaps": gaps,
        }

        user_prompt = (
            "You are writing a brief CEFR test summary in Chinese for a student. "
            "Use 4-6 short sentences. Mention estimated level, confidence, strongest area, "
            "weakest area, and one next-step study suggestion.\n"
            f"Result data: {result}"
        )
        report = self._llm.chat(
            system_prompt="You are a concise CEFR assessment assistant.",
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=220,
        )
        result["llm_summary"] = report or self._default_report(result)
        session.finished = True
        session.final_result = result
