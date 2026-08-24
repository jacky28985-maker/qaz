import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.INREAD_DATA_DIR || "/app/data";
const SEED_BANK_PATH = path.join(DATA_DIR, "grammar-seed-bank.json");
const GENERATED_BANK_PATH = path.join(DATA_DIR, "grammar-question-bank.generated.json");
const GRAMMAR_MODEL_BASE_URL = (process.env.GRAMMAR_LLM_BASE_URL || "http://127.0.0.1:18010/v1").replace(/\/$/, "");
const GRAMMAR_MODEL_NAME = process.env.GRAMMAR_LLM_MODEL || "inread-qwen3-4b";
const GRAMMAR_MODEL_API_KEY = process.env.GRAMMAR_LLM_API_KEY || "team2-local-token";

const TARGET_BLUEPRINT = [
  { slot: 1, area: "phrase_structure" },
  { slot: 2, area: "sentence_structure" },
  { slot: 3, area: "tense_aspect" },
  { slot: 4, area: "phrase_structure" },
  { slot: 5, area: "sentence_structure" },
  { slot: 6, area: "tense_aspect" },
  { slot: 7, area: "sentence_structure" },
  { slot: 8, area: "phrase_structure" },
  { slot: 9, area: "sentence_structure" },
  { slot: 10, area: "tense_aspect" },
  { slot: 11, area: "sentence_structure" },
  { slot: 12, area: "phrase_structure" },
  { slot: 13, area: "sentence_structure" },
  { slot: 14, area: "tense_aspect" },
  { slot: 15, area: "sentence_structure" },
  { slot: 16, area: "phrase_structure" },
  { slot: 17, area: "sentence_structure" },
  { slot: 18, area: "tense_aspect" },
  { slot: 19, area: "sentence_structure" },
  { slot: 20, area: "phrase_structure" }
];

const AREA_LABELS = {
  zh: {
    sentence_structure: "句子结构",
    phrase_structure: "短语结构",
    tense_aspect: "时态与语气"
  },
  en: {
    sentence_structure: "sentence structure",
    phrase_structure: "phrase structure",
    tense_aspect: "tense and mood"
  }
};

const TAG_LABELS = {
  zh: {
    relative_clause: "定语从句",
    sentence_structure: "长句结构",
    gerund_after_preposition: "介词后动名词",
    fixed_collocation: "固定搭配",
    past_perfect: "过去完成时",
    time_clause: "时间逻辑",
    reduced_clause: "省略结构",
    passive_voice: "被动语态",
    subjunctive: "虚拟语气",
    inversion: "倒装",
    negative_adverbial: "否定副词倒装",
    nonfinite: "非谓语",
    post_modifier: "后置修饰",
    mixed_conditional: "错综虚拟",
    not_until: "Not until 结构",
    preposition: "介词搭配",
    concession: "让步结构",
    non_restrictive_clause: "非限制性从句",
    quantifier_clause: "数量词 + 从句",
    hardly_scarcely: "Hardly/Scarcely 结构",
    as_if: "as if / as though",
    result_clause: "结果结构",
    active_modifier: "主动非谓语",
    no_sooner: "No sooner 结构",
    preposition_clause: "介词 + 从句",
    much_as: "Much as 结构",
    so_such: "So/Such 倒装",
    that_clause: "that 从句",
    subject_verb_agreement: "主谓一致",
    not_only: "Not only 倒装",
    subjunctive_inversion: "虚拟倒装",
    linking_adverb: "连接副词",
    phrasal_verb: "动词短语",
    communication: "表达与传达",
    were_it_not_for: "Were it not for",
    emphasis: "强调句",
    cleft_sentence: "It-cleft 强调",
    future_perfect: "将来完成时",
    time_reference: "时间指向",
    mandative: "mandative subjunctive"
  },
  en: {
    relative_clause: "relative clauses",
    sentence_structure: "complex sentence structure",
    gerund_after_preposition: "gerunds after prepositions",
    fixed_collocation: "fixed collocations",
    past_perfect: "past perfect",
    time_clause: "time-sequence control",
    reduced_clause: "reduced clauses",
    passive_voice: "passive voice",
    subjunctive: "subjunctive mood",
    inversion: "inversion",
    negative_adverbial: "negative adverbial inversion",
    nonfinite: "non-finite structures",
    post_modifier: "post-modification",
    mixed_conditional: "mixed conditionals",
    not_until: "\"not until\" structure",
    preposition: "preposition collocations",
    concession: "concessive structures",
    non_restrictive_clause: "non-restrictive clauses",
    quantifier_clause: "quantifier clauses",
    hardly_scarcely: "\"hardly/scarcely\" pattern",
    as_if: "\"as if / as though\"",
    result_clause: "result clauses",
    active_modifier: "active participle modifiers",
    no_sooner: "\"no sooner\" pattern",
    preposition_clause: "preposition-led clauses",
    much_as: "\"much as\" structure",
    so_such: "\"so/such\" inversion",
    that_clause: "\"that\" clauses",
    subject_verb_agreement: "subject-verb agreement",
    not_only: "\"not only\" inversion",
    subjunctive_inversion: "subjunctive inversion",
    linking_adverb: "linking adverbs",
    phrasal_verb: "phrasal verbs",
    communication: "communication phrasal verbs",
    were_it_not_for: "\"were it not for\"",
    emphasis: "emphasis",
    cleft_sentence: "cleft sentences",
    future_perfect: "future perfect",
    time_reference: "time reference",
    mandative: "mandative subjunctive"
  }
};

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

function normalizeStem(stem) {
  return String(stem || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function cloneQuestion(question) {
  return JSON.parse(JSON.stringify(question));
}

function seededNumber(seed) {
  const digest = crypto.createHash("sha256").update(seed).digest("hex");
  return Number.parseInt(digest.slice(0, 12), 16);
}

function seededShuffle(items, seed) {
  return items
    .map((item, index) => ({ item, sortKey: seededNumber(`${seed}:${index}:${item.id || item.stem}`) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry) => entry.item);
}

function shuffleOptions(question, seed) {
  const correctOption = question.options[question.answerIndex];
  const shuffled = seededShuffle(question.options.map((option, index) => ({ option, index })), seed);
  return {
    ...question,
    options: shuffled.map((entry) => entry.option),
    answerIndex: shuffled.findIndex((entry) => entry.option === correctOption)
  };
}

function labelForArea(area, language) {
  return AREA_LABELS[language]?.[area] || AREA_LABELS.en[area] || area;
}

function labelForTag(tag, language) {
  return TAG_LABELS[language]?.[tag] || TAG_LABELS.en[tag] || tag;
}

function loadGrammarBank() {
  const merged = [...readJsonFile(SEED_BANK_PATH), ...readJsonFile(GENERATED_BANK_PATH)];
  const seen = new Set();
  return merged.filter((item) => {
    const key = normalizeStem(item.stem);
    if (!item?.stem || seen.has(key)) return false;
    seen.add(key);
    return Array.isArray(item.options) && item.options.length === 4;
  });
}

function candidateScore(question, blueprint, tagCounts, recentAreas, seed) {
  const distance = Math.abs(Number(question.difficulty || 10) - blueprint.slot);
  const missingAreaPenalty = question.areas?.includes(blueprint.area) ? 0 : 5;
  const recentAreaPenalty = recentAreas.includes(blueprint.area) && question.areas?.includes(blueprint.area) ? 1.8 : 0;
  const repetitionPenalty = Math.max(...(question.tags || []).map((tag) => tagCounts[tag] || 0), 0) * 0.7;
  const tieBreaker = seededNumber(`${seed}:${blueprint.slot}:${question.id}`) / 1e12;
  return distance * 3 + missingAreaPenalty + recentAreaPenalty + repetitionPenalty + tieBreaker;
}

export function selectGrammarQuestions(bank, sessionId) {
  const chosen = [];
  const usedIds = new Set();
  const tagCounts = {};
  const recentAreas = [];

  for (const blueprint of TARGET_BLUEPRINT) {
    const candidates = bank.filter((question) => !usedIds.has(question.id));
    candidates.sort((left, right) => {
      return candidateScore(left, blueprint, tagCounts, recentAreas, sessionId) -
        candidateScore(right, blueprint, tagCounts, recentAreas, sessionId);
    });
    const picked = cloneQuestion(candidates[0] || bank[chosen.length % bank.length]);
    if (!picked) {
      throw new Error("GRAMMAR_BANK_EMPTY");
    }
    const randomized = shuffleOptions(picked, `${sessionId}:${blueprint.slot}`);
    chosen.push({
      ...randomized,
      ordinal: blueprint.slot
    });
    usedIds.add(picked.id);
    recentAreas.push(blueprint.area);
    if (recentAreas.length > 3) recentAreas.shift();
    for (const tag of randomized.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return chosen;
}

export function createGrammarSession({ userId, bookId, bookTitle, vocabularyTierKey, language = "zh" }) {
  const bank = loadGrammarBank();
  if (!bank.length) throw new Error("GRAMMAR_BANK_EMPTY");
  const sessionId = crypto.randomUUID();
  return {
    id: sessionId,
    userId,
    bookId,
    bookTitle,
    vocabularyTierKey,
    language,
    startedAt: new Date().toISOString(),
    deadlineAt: Date.now() + 7 * 60 * 1000,
    currentIndex: 0,
    questions: selectGrammarQuestions(bank, sessionId),
    answers: []
  };
}

export function getPublicGrammarQuestion(session) {
  const question = session.questions[session.currentIndex];
  if (!question) return null;
  return {
    id: question.id,
    ordinal: question.ordinal,
    total: session.questions.length,
    stem: question.stem,
    options: question.options
  };
}

function baseSummary(result, language) {
  const areaEntries = Object.entries(result.areaBreakdown || {}).sort((left, right) => left[1].accuracy - right[1].accuracy);
  const weakest = areaEntries[0];
  const strongest = areaEntries[areaEntries.length - 1];
  if (language === "en") {
    if (result.signal === "stable") {
      return `Your grammar signal is steady overall. ${strongest ? `You handled ${labelForArea(strongest[0], language)} most reliably.` : ""} Keep the momentum and move into the vocabulary plan.`;
    }
    if (result.signal === "watch") {
      return `Your grammar is usable, but ${weakest ? labelForArea(weakest[0], language) : "a few structures"} could still slow reading down. Continue to the vocabulary plan and keep an eye on those patterns.`;
    }
    return `Grammar may still become a visible reading barrier, especially around ${weakest ? labelForArea(weakest[0], language) : "longer sentence patterns"}. Continue to the vocabulary plan, but review the highlighted grammar points as well.`;
  }
  if (result.signal === "stable") {
    return `你的语法整体比较稳，${strongest ? `在${labelForArea(strongest[0], language)}上最稳定。` : ""}可以继续进入词汇训练，把主要精力放回阅读本身。`;
  }
  if (result.signal === "watch") {
    return `你的语法基础可以支撑阅读，但${weakest ? labelForArea(weakest[0], language) : "部分结构"}还会拖慢理解。建议继续进入词汇训练，同时留意这些语法点。`;
  }
  return `你的语法还可能成为阅读阻力，尤其是在${weakest ? labelForArea(weakest[0], language) : "长难句处理"}上。建议继续词汇训练，但也把结果页提示的语法点一起补一下。`;
}

async function buildModelSummary(result, language) {
  const prompt = {
    language,
    signal: result.signal,
    correctCount: result.correctCount,
    totalCount: result.totalCount,
    strongest: result.strongPoints,
    weakest: result.weakPoints,
    nextAction: result.nextAction
  };
  try {
    const response = await fetch(`${GRAMMAR_MODEL_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${GRAMMAR_MODEL_API_KEY}`
      },
      body: JSON.stringify({
        model: GRAMMAR_MODEL_NAME,
        temperature: 0.35,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content: language === "en"
              ? "Write one concise grammar-diagnostic summary for an English-reading product. Mention at most two strengths, at most two weak points, and the next action. Plain text only."
              : "请为英语阅读产品写一段简短的语法诊断总结。最多提两项优势、两项薄弱点，并给出下一步动作。只输出纯文本，不要列表，不要解释你的推理。"
          },
          {
            role: "user",
            content: JSON.stringify(prompt)
          }
        ]
      }),
      cache: "no-store"
    });
    if (!response.ok) throw new Error("MODEL_SUMMARY_FAILED");
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const cleaned = String(content).replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return cleaned || null;
  } catch {
    return null;
  }
}

function buildNextAction(vocabularyTierKey, language) {
  const goToVocabulary = ["stretch", "challenging", "not_recommended"].includes(vocabularyTierKey);
  if (language === "en") {
    return goToVocabulary ? "continue_vocabulary_training" : "return_to_reading_recommendation";
  }
  return goToVocabulary ? "continue_vocabulary_training" : "return_to_reading_recommendation";
}

function questionWasCorrect(question, selectedIndex) {
  return Number(selectedIndex) === Number(question.answerIndex);
}

export async function finalizeGrammarSession(session) {
  const totalCount = session.questions.length;
  const correctCount = session.answers.filter((item) => item.correct).length;
  const accuracy = totalCount ? correctCount / totalCount : 0;

  const areaBreakdown = {};
  const tagScores = {};
  for (const answer of session.answers) {
    const question = session.questions.find((item) => item.id === answer.questionId);
    if (!question) continue;
    for (const area of question.areas || []) {
      areaBreakdown[area] = areaBreakdown[area] || { correct: 0, total: 0 };
      areaBreakdown[area].total += 1;
      if (answer.correct) areaBreakdown[area].correct += 1;
    }
    for (const tag of question.tags || []) {
      tagScores[tag] = tagScores[tag] || { weightedWrong: 0, weightedRight: 0 };
      if (answer.correct) tagScores[tag].weightedRight += Number(question.difficulty || 1);
      else tagScores[tag].weightedWrong += Number(question.difficulty || 1);
    }
  }

  const normalizedAreaBreakdown = Object.fromEntries(
    Object.entries(areaBreakdown).map(([area, value]) => [
      area,
      {
        ...value,
        accuracy: value.total ? Number((value.correct / value.total).toFixed(2)) : 0
      }
    ])
  );

  const weakPoints = Object.entries(tagScores)
    .sort((left, right) => right[1].weightedWrong - left[1].weightedWrong || left[0].localeCompare(right[0]))
    .filter(([, value]) => value.weightedWrong > 0)
    .slice(0, 3)
    .map(([tag]) => labelForTag(tag, session.language));

  const strongPoints = Object.entries(tagScores)
    .sort((left, right) => right[1].weightedRight - left[1].weightedRight || left[0].localeCompare(right[0]))
    .filter(([, value]) => value.weightedRight > value.weightedWrong)
    .slice(0, 3)
    .map(([tag]) => labelForTag(tag, session.language));

  const signal = accuracy >= 0.78 && Object.values(normalizedAreaBreakdown).every((item) => item.accuracy >= 0.55)
    ? "stable"
    : accuracy >= 0.58
      ? "watch"
      : "needs_support";

  const result = {
    signal,
    correctCount,
    totalCount,
    accuracy: Number((accuracy * 100).toFixed(1)),
    areaBreakdown: normalizedAreaBreakdown,
    strongPoints: strongPoints.length ? strongPoints : [session.language === "en" ? "basic grammatical control" : "基础语法控制"],
    weakPoints: weakPoints.length ? weakPoints : [session.language === "en" ? "borderline complex structures" : "临界长难句结构"],
    nextAction: buildNextAction(session.vocabularyTierKey, session.language),
    completedAt: new Date().toISOString()
  };

  result.summary = (await buildModelSummary(result, session.language)) || baseSummary(result, session.language);
  return result;
}

export function advanceGrammarSession(session, choiceIndex) {
  const currentQuestion = session.questions[session.currentIndex];
  if (!currentQuestion) throw new Error("GRAMMAR_SESSION_FINISHED");
  const answer = {
    questionId: currentQuestion.id,
    selectedIndex: Number(choiceIndex),
    correct: questionWasCorrect(currentQuestion, choiceIndex)
  };
  session.answers.push(answer);
  session.currentIndex += 1;
  return answer;
}
