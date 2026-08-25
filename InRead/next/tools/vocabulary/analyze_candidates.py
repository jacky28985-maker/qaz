#!/usr/bin/env python3
"""Ask an OpenAI-compatible local model to select high-value book vocabulary."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen


SYSTEM_PROMPT = """You are InRead's literary vocabulary curator. Select English words that materially help a Chinese learner understand this specific classic novel. Do not select proper names, transparent inflections, archaic trivia, or words that can be guessed without learning. Prioritize recurring words, narrative verbs, relationship/emotion words, and words central to plot, setting, tone, or dialogue. Return JSON only: {\"recommended\":[{\"word\":string,\"cefr\":\"A1|A2|B1|B2|C1|C2\",\"priority\":1-5,\"reason_zh\":string,\"translation_zh\":string,\"example\":string,\"example_translation_zh\":string}]}. Preserve the original spelling and choose only supplied candidates."""


def call_model(endpoint: str, model: str, book: dict, candidates: list[dict]) -> dict:
    prompt = {
        "title": book["title"],
        "author": book["author"],
        "task": "Select the most useful words from this candidate batch. Keep at most 35.",
        "candidates": candidates,
    }
    payload = json.dumps({"model": model, "messages": [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)}], "temperature": 0.15, "max_tokens": 5000, "response_format": {"type": "json_object"}}).encode("utf-8")
    request = Request(f"{endpoint.rstrip('/')}/v1/chat/completions", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=600) as response:
        body = json.loads(response.read().decode("utf-8"))
    return json.loads(body["choices"][0]["message"]["content"])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--endpoint", default="http://127.0.0.1:8001")
    parser.add_argument("--model", default="inread-qwen3-14b")
    parser.add_argument("--batch-size", type=int, default=65)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    for candidate_path in sorted(args.corpus.glob("*/candidates.json")):
        book = json.loads(candidate_path.read_text(encoding="utf-8"))
        result_path = args.output / f"{book['id']}.json"
        if result_path.exists():
            print(f"skip {book['title']}")
            continue
        selected = []
        for start in range(0, len(book["candidates"]), args.batch_size):
            response = call_model(args.endpoint, args.model, book, book["candidates"][start:start + args.batch_size])
            selected.extend(response.get("recommended", []))
            time.sleep(0.2)
        unique = {entry["word"].lower(): entry for entry in selected if entry.get("word")}
        payload = {"id": book["id"], "title": book["title"], "author": book["author"], "recommended_words": sorted(unique.values(), key=lambda item: (-item.get("priority", 0), item["word"]))}
        result_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{book['title']}: {len(payload['recommended_words'])} recommended words")


if __name__ == "__main__":
    main()
