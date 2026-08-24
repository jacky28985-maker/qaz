const DEFAULT_LANGUAGE = "en";
const LANGUAGE_STORAGE_KEY = "inread-language";
const THEME_STORAGE_KEY = "inread-theme";
const THEME_EGG_STORAGE_KEY = "inread-theme-easter-egg";
const BASE_THEMES = ["light", "dark", "pink", "blue"];
const ALL_THEMES = [...BASE_THEMES, "aurora"];
const UNKNOWN_THRESHOLD = 24;
const HIGH_FREQUENCY_LIMIT = 12;
const SUGGESTION_LIMIT = 5;
const STUDY_CARD_TYPES = ["zh_to_en_choice", "en_to_zh_choice", "zh_to_en_spell", "scene_to_en_choice", "scene_to_zh_choice"];
const STUDY_ENGINE_VERSION = 2;

const MATCH_FILL_CLASS = {
  relaxed: "match-fill-easy",
  warmup: "match-fill-warmup",
  recommended: "match-fill-right",
  stretch: "match-fill-stretch",
  demanding: "match-fill-demanding",
  not_yet: "match-fill-hard",
  unknown: "match-fill-unknown"
};

const RESULT_ACTION_COPY = {
  en: {
    noPlan: "No study plan needed",
    generatePlan: "Create reading plan",
    directChallenge: "Direct challenge (continue anyway)",
    recommendedRead: "Recommended to start reading",
    tryRead: "Try reading now"
  },
  zh: {
    noPlan: "无需生成计划",
    generatePlan: "创建阅读计划",
    directChallenge: "直接挑战（无视风险继续阅读）",
    recommendedRead: "推荐您进行阅读",
    tryRead: "可以先读起来"
  }
};

const LIBRARY_MATCH_META = {
  en: {
    relaxed: {
      label: "Relaxed reading",
      hint: "This sits well below your current boundary and could work as an easy, low-pressure read."
    },
    warmup: {
      label: "Good warm-up",
      hint: "A little lighter than your current level, which makes it useful for building rhythm and confidence."
    },
    recommended: {
      label: "Recommended for you",
      hint: "This is the closest fit to your current level and is a strong choice to start now."
    },
    stretch: {
      label: "Challenging but doable",
      hint: "You will feel some resistance, but it still looks like a productive stretch."
    },
    demanding: {
      label: "A bigger challenge",
      hint: "Some preparation would likely make this reading experience much smoother."
    },
    not_yet: {
      label: "Not recommended yet",
      hint: "At your current level, starting this book now would probably feel heavy too early."
    },
    unknown: {
      label: "Needs a test first",
      hint: "Finish one or two book tests first, and the fit signal will become more reliable."
    }
  },
  zh: {
    relaxed: {
      label: "轻松阅读",
      hint: "这本书明显低于你当前边界，更适合作为放松阅读。"
    },
    warmup: {
      label: "适合作为热身",
      hint: "它比你当前水平略轻一些，适合先建立节奏和信心。"
    },
    recommended: {
      label: "推荐您进行阅读",
      hint: "它和你当前水平最贴近，适合现在开始。"
    },
    stretch: {
      label: "有挑战但可尝试",
      hint: "阅读时会有一点阻力，但整体仍在可攻克范围内。"
    },
    demanding: {
      label: "挑战较大",
      hint: "建议先做少量准备，再进入正文会更顺。"
    },
    not_yet: {
      label: "暂不建议阅读",
      hint: "按你当前水平直接读它会比较吃力，更适合后面再挑战。"
    },
    unknown: {
      label: "待测后推荐",
      hint: "先完成一本到两本测试，推荐会更准确。"
    }
  }
};

const READINESS_META = {
  en: {
    ready_now: {
      code: "R1",
      label: "Recommended to read now",
      description: "R1: There is almost no visible vocabulary friction. The best next step is to begin real reading immediately.",
      philosophy: "You are already near open-the-book-and-read territory. Vocabulary can keep growing naturally inside the text.",
      guide: "Almost no barrier. Start reading directly.",
      tone: "positive",
      readyMessage: ({ title }) => `"${title}" is essentially open for you now. The best move is to begin reading right away.`,
      preparedMessage: ({ title }) => `You are fully ready for "${title}". Go back into the text and let learning continue there.`,
      pendingMessage: ({ title }) => `"${title}" is already within reach. You do not need a prep phase before reading.`,
      readyLabel: "Recommended to read now",
      pendingLabel: "Recommended to read now"
    },
    good_to_go: {
      code: "R2",
      label: "Suitable for direct reading",
      description: "R2: There are a few unfamiliar words, but not enough to keep breaking your comprehension.",
      philosophy: "A small amount of uncertainty is normal. The point is not to eliminate every unknown word before reading.",
      guide: "A few blockers only. You can read directly.",
      tone: "positive",
      readyMessage: ({ title }) => `"${title}" should be comfortable enough to start directly, even if a few words still need to be learned in context.`,
      preparedMessage: ({ title }) => `You are well-positioned for "${title}". Reading directly is the recommended next step.`,
      pendingMessage: ({ title }) => `"${title}" is already suitable for direct reading. A big prep phase would likely be unnecessary.`,
      readyLabel: "Suitable for direct reading",
      pendingLabel: "Suitable for direct reading"
    },
    can_try: {
      code: "R3",
      label: "Can adapt while reading",
      description: "R3: You will meet some unfamiliar words, but the book still looks manageable enough to grow into through reading itself.",
      philosophy: "This is often the sweet spot where reading remains real, while vocabulary continues to build in context.",
      guide: "Some friction, but still manageable through reading.",
      tone: "balanced",
      readyMessage: ({ title }) => `"${title}" may stretch you a little, but it is still reasonable to begin and adapt as you go.`,
      preparedMessage: ({ title }) => `You are ready to try "${title}". Let the remaining learning happen inside the reading process.`,
      pendingMessage: ({ title }) => `"${title}" does not require a heavy prep stage. It is reasonable to start and adapt in context.`,
      readyLabel: "Can adapt while reading",
      pendingLabel: "Can adapt while reading"
    },
    stretch: {
      code: "R4",
      label: "Has some challenge",
      description: "R4: The book will create noticeable friction. A small amount of targeted preparation would make the first stretch much smoother.",
      philosophy: "Preparation is only useful when it shortens the path back into the book itself.",
      guide: "Noticeable resistance. A small prep step is recommended.",
      tone: "caution",
      readyMessage: ({ title }) => `You chose to challenge "${title}" directly. Expect some friction, but the book is still within a meaningful stretch range.`,
      preparedMessage: ({ title }) => `You have already cleared the key blockers for "${title}". Now you can begin with a manageable level of challenge.`,
      pendingMessage: ({ title }) => `"${title}" will feel challenging at the start. Clearing the most important blockers first would help a lot.`,
      readyLabel: "Challenge is manageable",
      pendingLabel: "Has some challenge"
    },
    challenging: {
      code: "R5",
      label: "Better after preparation",
      description: "R5: The current barrier is fairly high. Preparing first would noticeably improve continuity and reduce frustration.",
      philosophy: "Even here, useful preparation should still be narrow and book-specific, not a return to mass memorization.",
      guide: "A bigger barrier. Prepare first if you want a smoother entry.",
      tone: "warning",
      readyMessage: ({ title }) => `You are entering "${title}" as a direct challenge. Expect to stop more often and rely on support from context or lookup.`,
      preparedMessage: ({ title }) => `You finished the minimum preparation for "${title}". It is still a challenge, but now it is more realistic to begin.`,
      pendingMessage: ({ title }) => `"${title}" is likely to feel heavy right now. A focused prep phase is strongly recommended before reading.`,
      readyLabel: "Prepared for a challenge",
      pendingLabel: "Better after preparation"
    },
    not_recommended: {
      code: "R6",
      label: "Not recommended right now",
      description: "R6: The risk of early frustration is high. It may be better to choose a closer-fit book first, or prepare around the biggest blockers before returning.",
      philosophy: "This is not a permanent no. It is a way to protect momentum and put effort where it is more likely to create progress.",
      guide: "High friction. Better to prepare first or choose an easier book.",
      tone: "danger",
      readyMessage: ({ title }) => `You decided to challenge "${title}" despite the current risk. Go in expecting heavy resistance and a slower reading rhythm.`,
      preparedMessage: ({ title }) => `You completed the current minimum preparation for "${title}". It may still be demanding, but you now have a clearer path into the book.`,
      pendingMessage: ({ title }) => `"${title}" is not a strong fit right now. A better-matched book or a focused prep stage would be safer choices.`,
      readyLabel: "High-risk challenge",
      pendingLabel: "Not recommended right now"
    }
  },
  zh: {
    ready_now: {
      code: "R1",
      label: "推荐您进行阅读",
      description: "R1：几乎没有明显词汇障碍。现在最符合产品初衷的动作，就是直接进入真实阅读。",
      philosophy: "你已经接近开卷即读的状态，词汇会继续在阅读中自然增长。",
      guide: "几乎无障碍，建议直接开始阅读。",
      tone: "positive",
      readyMessage: ({ title }) => `《${title}》对你来说几乎没有明显门槛，推荐现在就开始阅读。`,
      preparedMessage: ({ title }) => `你已经完全具备阅读《${title}》的条件，现在最好的动作就是回到正文。`,
      pendingMessage: ({ title }) => `《${title}》已经在你的可读范围内，不需要再单独做前置准备。`,
      readyLabel: "推荐您进行阅读",
      pendingLabel: "推荐您进行阅读"
    },
    good_to_go: {
      code: "R2",
      label: "适合直接阅读",
      description: "R2：会遇到少量生词，但不足以持续打断理解，适合直接开始。",
      philosophy: "少量不确定感是正常的，目标不是在阅读前把所有生词都清空。",
      guide: "只有少量阻碍，可以直接开始阅读。",
      tone: "positive",
      readyMessage: ({ title }) => `《${title}》整体已经足够顺滑，可以直接开始阅读，把少量陌生词放回语境里慢慢消化。`,
      preparedMessage: ({ title }) => `你已经处在适合直接阅读《${title}》的位置，不需要额外铺垫。`,
      pendingMessage: ({ title }) => `《${title}》已经适合直接阅读，额外做一大段准备的收益不会太高。`,
      readyLabel: "适合直接阅读",
      pendingLabel: "适合直接阅读"
    },
    can_try: {
      code: "R3",
      label: "可边读边适应",
      description: "R3：会遇到一些陌生词，但整体仍然可以在阅读中逐步适应，不必先背大量单词。",
      philosophy: "这往往是最适合自然习得的区间，既保留真实阅读，也能在语境里继续长词汇。",
      guide: "有一定阻力，但仍可在阅读中慢慢适应。",
      tone: "balanced",
      readyMessage: ({ title }) => `《${title}》会让你稍微费一点力，但仍然值得直接读起来，在阅读中逐步适应。`,
      preparedMessage: ({ title }) => `你已经可以开始尝试《${title}》，剩下的学习更适合在阅读过程中自然发生。`,
      pendingMessage: ({ title }) => `《${title}》不需要重型准备，直接开始阅读并在语境中适应是可行的。`,
      readyLabel: "可边读边适应",
      pendingLabel: "可边读边适应"
    },
    stretch: {
      code: "R4",
      label: "有挑战性",
      description: "R4：阅读时会有明显阻力。先做少量、精准的准备，会让你更容易进入状态。",
      philosophy: "真正有价值的准备，是为了更快回到书里，而不是把任务越堆越重。",
      guide: "阻力较明显，建议先处理关键障碍词。",
      tone: "caution",
      readyMessage: ({ title }) => `你选择直接挑战《${title}》。它会带来一些阻力，但仍属于值得尝试的挑战范围。`,
      preparedMessage: ({ title }) => `你已经为《${title}》完成了最小量准备，现在可以带着一定挑战开始阅读。`,
      pendingMessage: ({ title }) => `《${title}》对你来说会有明显挑战。先清理最关键的障碍词，会更容易进入正文。`,
      readyLabel: "可挑战阅读",
      pendingLabel: "有挑战性"
    },
    challenging: {
      code: "R5",
      label: "建议准备后阅读",
      description: "R5：当前阻力较大。先准备会明显提升阅读连续性，也更能避免挫败感。",
      philosophy: "即使在这个等级里，准备也应该只围绕当前这一本到书，而不是回到海量背词。",
      guide: "门槛较高，先准备会更稳。",
      tone: "warning",
      readyMessage: ({ title }) => `你选择把《${title}》作为直接挑战来读。阅读节奏可能会比较慢，需要接受更频繁的卡顿。`,
      preparedMessage: ({ title }) => `你已经完成《${title}》当前阶段的最小准备量。它仍有挑战，但现在更适合开始。`,
      pendingMessage: ({ title }) => `《${title}》目前对你来说阻力偏大，更建议先做一次有针对性的准备。`,
      readyLabel: "准备后可尝试阅读",
      pendingLabel: "建议准备后阅读"
    },
    not_recommended: {
      code: "R6",
      label: "不建议您阅读",
      description: "R6：当前直接进入这本书的风险较高。更建议先换一本到更匹配的书，或先处理最关键的障碍词。",
      philosophy: "这里的不建议，并不是永久否定，而是为了保护你的阅读动力，把努力放到更容易形成正反馈的地方。",
      guide: "当前阻力很高，更适合先准备或先换一本到更匹配的书。",
      tone: "danger",
      readyMessage: ({ title }) => `你决定无视当前风险直接挑战《${title}》。阅读时大概率会频繁受阻，请做好心理预期。`,
      preparedMessage: ({ title }) => `你已经完成《${title}》当前阶段的最小准备量。它依然偏难，但现在至少有了更清晰的进入路径。`,
      pendingMessage: ({ title }) => `《${title}》现在并不是一个理想匹配。更建议先换一本到更合适的书，或先处理最重要的障碍词。`,
      readyLabel: "高风险挑战",
      pendingLabel: "不建议您阅读"
    }
  }
};

const TAG_LABELS = {
  经典: { en: "Classic", zh: "经典" },
  社会: { en: "Society", zh: "社会" },
  成长: { en: "Growth", zh: "成长" },
  奇幻: { en: "Fantasy", zh: "奇幻" },
  冒险: { en: "Adventure", zh: "冒险" },
  校园: { en: "Campus", zh: "校园" },
  爱情: { en: "Romance", zh: "爱情" },
  社交: { en: "Manners", zh: "社交" },
  童话: { en: "Fable", zh: "童话" },
  治愈: { en: "Gentle", zh: "治愈" },
  科幻: { en: "Sci-Fi", zh: "科幻" },
  反乌托邦: { en: "Dystopia", zh: "反乌托邦" },
  神话: { en: "Myth", zh: "神话" },
  自然: { en: "Nature", zh: "自然" },
  短篇: { en: "Short", zh: "短篇" },
  演示: { en: "Demo", zh: "演示" },
  自定义: { en: "Custom", zh: "自定义" }
};

const BOOK_COPY = {
  "great-gatsby": {
    en: {
      blurb: "Luxury and disillusionment overlap here, making it a strong demo of how recurring literary vocabulary shapes reading flow.",
      coverage: "High-frequency words from chapters 1-8"
    }
  },
  "harry-potter-1": {
    en: {
      blurb: "Dense fantasy scenes make this a good example of learning a few key words, then returning to the story itself.",
      coverage: "High-frequency words from chapters 1-10"
    }
  },
  "pride-prejudice": {
    en: {
      blurb: "Politeness, judgment, and social nuance appear often, showing how abstract but frequent words affect comprehension.",
      coverage: "High-frequency words from chapters 1-12"
    }
  },
  "charlottes-web": {
    en: {
      blurb: "Warm and clear language makes this a reassuring first step for readers starting original English books.",
      coverage: "High-frequency words from chapters 1-9"
    }
  },
  "the-hobbit": {
    en: {
      blurb: "Adventure drives the story forward, but fantasy scene words and descriptive language still add real texture.",
      coverage: "High-frequency words from chapters 1-7"
    }
  },
  "the-giver": {
    en: {
      blurb: "Sentence structure stays approachable, while concentrated abstract vocabulary makes it ideal for transition readers.",
      coverage: "High-frequency words from chapters 1-11"
    }
  },
  "percy-jackson-1": {
    en: {
      blurb: "Fast pacing and dialogue-heavy scenes work well for readers who like modern adventure storytelling.",
      coverage: "High-frequency words from chapters 1-8"
    }
  },
  "old-man-sea": {
    en: {
      blurb: "The syntax is spare, but sea vocabulary and patient pacing still ask for some adjustment.",
      coverage: "High-frequency words from the full book"
    }
  }
};

const WORD_GLOSSARY = {
  "abrupt": "突然的",
  "accomplished": "熟练的",
  "affability": "亲切",
  "ambrosia": "神食",
  "amiable": "和蔼的",
  "amiably": "和善地",
  "apprehensive": "忧虑的",
  "assignment": "任务",
  "astonished": "惊讶的",
  "astonishment": "惊讶",
  "barn": "谷仓",
  "betrayal": "背叛",
  "bewildered": "困惑的",
  "bewilderment": "困惑",
  "bewitched": "着迷的",
  "bravery": "勇敢",
  "briskly": "轻快地",
  "burglary": "入室盗窃",
  "camouflage": "伪装",
  "capacity": "容量",
  "carnage": "大屠杀",
  "cavern": "洞穴",
  "certainty": "确定",
  "civility": "礼貌",
  "cleverness": "聪明",
  "companion": "同伴",
  "composure": "镇定",
  "conceit": "自负",
  "conceited": "自负的",
  "conspicuous": "显眼的",
  "contented": "满足的",
  "countenance": "面容",
  "courageous": "勇敢的",
  "current": "水流",
  "cynical": "愤世嫉俗的",
  "dazzling": "耀眼的",
  "decorum": "礼仪",
  "defeated": "被击败的",
  "delicate": "精致的",
  "delightful": "令人愉快的",
  "despair": "绝望",
  "determined": "坚定的",
  "dignity": "尊严",
  "disconcerting": "令人不安的",
  "disdain": "轻蔑",
  "dread": "恐惧",
  "drift": "漂流",
  "dwarves": "矮人",
  "earnest": "认真的",
  "elation": "欣喜",
  "elegance": "优雅",
  "enchanted": "被施了魔法的",
  "endure": "忍受",
  "falter": "踌躇",
  "feigned": "假装的",
  "felicity": "幸福",
  "forbidden": "被禁止的",
  "formidable": "强大的",
  "fragment": "碎片",
  "frail": "脆弱的",
  "fret": "烦恼",
  "frightened": "害怕的",
  "furtive": "鬼鬼祟祟的",
  "fury": "狂怒",
  "gaudy": "花哨的",
  "gaunt": "消瘦的",
  "gently": "轻柔地",
  "gleaming": "闪亮的",
  "glimmer": "微光",
  "gloomy": "阴沉的",
  "glorious": "辉煌的",
  "goblin": "小妖精",
  "grim": "严峻的",
  "grimace": "鬼脸",
  "groan": "呻吟",
  "groggy": "昏沉的",
  "grotesque": "怪诞的",
  "gulf": "海湾",
  "harpoon": "鱼叉",
  "hauteur": "傲慢",
  "heedlessly": "漫不经心地",
  "hesitate": "犹豫",
  "hook": "钩子",
  "hover": "盘旋",
  "humble": "谦逊的",
  "humiliation": "羞辱",
  "immortal": "不朽的",
  "impenetrable": "无法穿透的",
  "impertinent": "无礼的",
  "indignant": "愤慨的",
  "indolent": "懒散的",
  "inevitable": "不可避免的",
  "inexhaustible": "无穷无尽的",
  "insinuate": "暗示",
  "intangible": "无形的",
  "integrity": "正直",
  "intricate": "复杂精巧的",
  "invisible": "看不见的",
  "languid": "慵懒的",
  "lavish": "奢侈的",
  "lightning": "闪电",
  "linger": "逗留",
  "lonesome": "孤单的",
  "lurked": "潜伏着",
  "lurking": "潜伏的",
  "marlin": "枪鱼",
  "mast": "桅杆",
  "meadow": "草地",
  "melancholy": "忧郁的",
  "memory": "记忆",
  "minotaur": "牛头怪",
  "mischief": "恶作剧",
  "mischievous": "淘气的",
  "mortification": "羞愧",
  "murmur": "低语",
  "mutter": "咕哝",
  "muttered": "咕哝着",
  "mythological": "神话的",
  "nebulous": "模糊的",
  "nurturer": "养育者",
  "oblige": "帮忙",
  "obscure": "模糊的",
  "ominous": "不祥的",
  "opulent": "富丽堂皇的",
  "oracle": "神谕",
  "partiality": "偏爱",
  "peculiar": "奇怪的",
  "perilous": "危险的",
  "plunder": "掠夺",
  "precision": "精确",
  "privation": "匮乏",
  "prophecy": "预言",
  "propriety": "得体",
  "quest": "探索",
  "radiance": "光辉",
  "radiant": "容光焕发的",
  "reassuring": "令人安心的",
  "reckless": "鲁莽的",
  "release": "释放",
  "reluctant": "不情愿的",
  "remarkable": "非凡的",
  "resentment": "怨恨",
  "resilient": "有韧性的",
  "resolve": "决心",
  "respect": "尊重",
  "respectable": "体面的",
  "restless": "不安的",
  "retrieve": "取回",
  "riddle": "谜语",
  "rigid": "僵硬的",
  "riotous": "喧闹的",
  "ritual": "仪式",
  "sail": "船帆",
  "salutations": "问候",
  "sameness": "千篇一律",
  "scarce": "稀少的",
  "serene": "宁静的",
  "shamefaced": "羞愧的",
  "shark": "鲨鱼",
  "shattered": "粉碎的",
  "shiver": "发抖",
  "shovel": "铲子",
  "shuddered": "战栗着",
  "sincere": "真诚的",
  "skiff": "小艇",
  "smoldering": "阴燃的",
  "snarled": "怒吼着",
  "soaring": "高飞的",
  "solemn": "庄重的",
  "solemnity": "庄重",
  "solicitude": "关切",
  "splendid": "极好的",
  "staggered": "摇晃的",
  "steady": "稳定的",
  "sting": "刺痛",
  "strange": "奇怪的",
  "subtle": "微妙的",
  "suffering": "痛苦",
  "supercilious": "傲慢的",
  "taut": "绷紧的",
  "temper": "脾气",
  "tenderly": "温柔地",
  "terrific": "极好的",
  "threshold": "门槛",
  "thunderous": "雷鸣般的",
  "torrent": "激流",
  "towering": "高耸的",
  "transcend": "超越",
  "transfixed": "呆住的",
  "transgression": "越轨",
  "transmit": "传递",
  "tremendous": "巨大的",
  "trident": "三叉戟",
  "triumph": "胜利",
  "trough": "食槽",
  "tumult": "骚动",
  "underworld": "冥界",
  "unexpected": "出乎意料的",
  "unsettling": "令人不安的",
  "urgent": "紧急的",
  "vexation": "恼火",
  "victory": "胜利",
  "vigilance": "警觉",
  "vivid": "生动的",
  "weary": "疲惫的",
  "weird": "古怪的",
  "whispering": "低语的",
  "wizardry": "魔法",
  "wretched": "凄惨的"
};

const COPY = {
  en: {
    modal: {
      eyebrow: "First visit",
      title: "Choose your interface language",
      copy: "English is the default. You can switch languages later from the top-right corner at any time.",
      englishTitle: "English",
      englishCopy: "Use the interface in English.",
      chineseTitle: "中文",
      chineseCopy: "切换为中文界面。",
      note: "Your choice will be remembered on this device."
    },
    match: {
      too_easy: {
        label: "Too easy",
        hint: "This one is probably light for you right now and could work as relaxed reading."
      },
      just_right: {
        label: "Just right",
        hint: "Based on your current test profile, this looks ready to read."
      },
      challenge: {
        label: "A slight stretch",
        hint: "A bit of preparation may help, but it is still a productive challenge."
      },
      too_hard: {
        label: "Too hard for now",
        hint: "With your current level, this book would likely feel heavy right away."
      },
      unknown: {
        label: "Needs a test first",
        hint: "Finish one or two book tests first, and the fit signal will become more reliable."
      }
    },
    searchPreview: {
      noProfile: {
        eyebrow: "How to use search",
        title: "Start by locating the book you actually want to read",
        copy: "Live fuzzy matching appears while you type. Click a suggestion to jump straight into that book's test, or press Enter / Search to open the full library results page.",
        stats: [
          ["Direct from dropdown", "Live fuzzy matches let you jump into the book-specific test immediately."],
          ["Library results", "Browse by tag, suggested vocabulary range, and fit color."],
          ["Better after testing", "Once you finish one or two tests, recommendation colors become more personal."]
        ],
        quoteTitle: "Current status",
        quoteCopy: "You do not have a stable reading profile yet, so the system is showing general recommendations. After a test, the library will begin adapting to your level."
      },
      profile: {
        eyebrow: "Your recent reading profile",
        title: ({ estimatedVocab }) => `Stable reading range around ${estimatedVocab} words`,
        copy: ({ sourceBook }) => `Based on your latest test on "${sourceBook}", the library will push the closest-fit books higher in the list.`,
        levelLabel: "Latest level",
        unknownLabel: "Latest unknown count",
        vocabLabel: "Estimated vocabulary",
        quoteTitle: "How to read the fit colors",
        quoteCopy: "White means easier, green means close fit, yellow and orange mean rising challenge, and red means it is probably too hard for now. You can filter by tag before deciding."
      }
    },
    suggestions: {
      searchLibrary: ({ query }) => `Search "${query}" in the library`,
      searchLibraryCopy: "No direct jump yet. Open the results page to browse more related books.",
      searchMore: "Search more related books",
      searchMoreCopy: "Open the library results page and compare more matches."
    },
    library: {
      allTags: "All tags",
      noProfile: {
        eyebrow: "Recommendation status",
        title: "No stable reading profile yet",
        copy: "You are currently browsing the general library. After one or two tests, this area will start showing more personal recommendation direction and fit signals."
      },
      profile: {
        eyebrow: "Based on your recent test",
        title: ({ estimatedVocab }) => `Recommended reading range around ${estimatedVocab} words`,
        copy: ({ sourceBook }) => `Books that sit closest to your current reading state will be prioritized first. Your current profile comes from the "${sourceBook}" test.`
      },
      headingQuery: ({ query }) => `Books related to "${query}"`,
      headingAll: "Full Library",
      summaryQuery: ({ count }) => `${count} related books found. Open any card to compare fit, then jump directly into the test.`,
      summaryAll: ({ count }) => `${count} demo books are currently in the library. Search, filter by tag, and use your latest test profile to find a better fit.`,
      emptyTitle: "No matching books",
      emptyCopy: "Try a shorter keyword, or switch back to all tags.",
      footer: ({ range, coverage }) => `Recommended for readers around ${range}. Signal source: ${coverage}.`,
      startTest: "Start test"
    },
    result: {
      verdicts: {
        L1: "No pre-study needed. You can read now.",
        L2: "Learn these blockers first, then start reading.",
        L3: "Clear the high-frequency blockers first, then begin."
      },
      descriptions: {
        L1: "L1 (high readiness): 0-5 unknown words. The action most aligned with the product idea is not more memorization, but starting real reading now.",
        L2: "L2 (medium readiness): 6-20 unknown words. Clear these core blockers first, then the text will flow much more smoothly.",
        L3: "L3 (low readiness): 21 or more unknown words. The system keeps only the highest-value blockers instead of pushing you back into mass memorization."
      },
      philosophy: {
        L1: "You are close to opening the book and simply reading. Learning can keep happening naturally inside the text.",
        L2: "This preparation is not meant to create more workload. It is meant to shorten the time before you can re-enter the book.",
        L3: "Even when many words are unknown, the system still avoids exhaustive memorization and focuses on the highest-frequency friction first."
      },
      noneTitle: "No obvious vocabulary barrier",
      noneCopy: "You are already close enough to direct reading that a larger word list would pull you away from the product's original purpose.",
      noPlan: "No plan needed",
      generatePlan: "Generate study plan",
      chapterMeta: ({ frequency, difficulty, chapter }) => `Frequency ${frequency} / Difficulty ${difficulty} / Around chapter ${chapter}.`
    },
    test: {
      difficulty: ({ difficulty }) => `Difficulty ${difficulty} / 5`,
      wordHint: ({ chapter, askedCount, total }) => `High-frequency word around chapter ${chapter}. Tested ${askedCount}/${total}.`,
      adaptiveNote: "A known word sends the probe higher. An unknown word brings it lower. The goal is to find this book's real reading boundary quickly."
    },
    plan: {
      day: ({ day }) => `Day ${day}`,
      count: ({ count }) => `${count} words`,
      sliderTitle: "Choose how many days you want to train",
      sliderValue: ({ days }) => `${days} days`,
      sliderHint: "When you stop sliding, InRead recalculates the pacing, daily word count, and estimated study time.",
      dayLabel: "Training days",
      dailyWordLabel: "Words per day",
      timeLabel: "Study time per day",
      summary: ({ days, dailyWords, dailyMinutes, totalMinutes }) => `At this pace, you will finish in about ${days} days, with around ${dailyWords} words and ${dailyMinutes} minutes of study per day. Total time is roughly ${totalMinutes} minutes.`,
      summaryEmpty: "Move the slider to generate a pacing summary for this book.",
      minutes: ({ minutes }) => `${minutes} min`,
      done: "Mastered",
      taskMeta: ({ chapter, frequency, difficulty }) => `Around chapter ${chapter} / Frequency ${frequency} / Difficulty ${difficulty}`,
      startToday: "Start today's training",
      continueToday: "Continue today's training",
      completedDay: "Completed",
      activeDay: "Today",
      lockedDay: "Locked for now",
      progress: ({ done, total }) => `${done}/${total} mastered`,
      rule: "Each word must pass at least 3 rounds. Missed words return sooner.",
      mapTitle: "Training map",
      viewWords: "View word list",
      hideWords: "Hide word list"
    },
    study: {
      progress: ({ mastered, total }) => `${mastered}/${total} words ready today`,
      roundsLabel: "Rounds completed",
      masteredLabel: "Mastered today",
      leftLabel: "Still in rotation",
      masteryRuleTitle: "Why this trainer repeats words",
      masteryRuleCopy: "Every word must survive at least three correct passes. Wrong answers re-enter sooner, so weak words stay visible without turning the whole plan into mass memorization.",
      questionHint: "Stay with the book-specific clue. This trainer only exists to clear the words that block the current text.",
      typeLabels: {
        zh_to_en_choice: "Chinese -> English",
        en_to_zh_choice: "English -> Chinese",
        zh_to_en_spell: "Chinese -> Spelling",
        scene_to_en_choice: "Scene -> English",
        scene_to_zh_choice: "Scene -> Chinese"
      },
      promptLabels: {
        zh_to_en_choice: "Choose the English word that matches this Chinese hint.",
        en_to_zh_choice: "Choose the best Chinese meaning for this English word.",
        zh_to_en_spell: "Type the English word that matches this Chinese hint.",
        scene_to_en_choice: "Use the visual cue and choose the matching English word.",
        scene_to_zh_choice: "Use the visual cue and choose the matching Chinese meaning."
      },
      inputPlaceholder: "Type the English word",
      submit: "Submit",
      backToPlan: "Back to plan",
      gotoGate: "View reading access",
      checklistTitle: "Today's checklist",
      completeTitle: "Today's words are ready",
      completeCopy: "Each word in this set has survived the minimum number of review rounds. You can return to the plan, unlock the next day, or move toward reading access if the full plan is complete.",
      currentDay: ({ day }) => `Day ${day} training`,
      targetBook: "Target book",
      sceneTitle: "Visual cue",
      sceneLabel: ({ gloss }) => `A scene about "${gloss}"`,
      correct: ({ word, gloss }) => `Correct. "${word}" matches “${gloss}”. It can move farther away in the queue now.`,
      incorrect: ({ word, gloss }) => `Not quite. "${word}" means “${gloss}”. It will return sooner.`,
      spellSuccess: ({ word, gloss }) => `Correct. You typed "${word}" for “${gloss}”.`,
      spellMiss: ({ word, gloss }) => `The spelling should be "${word}". It means “${gloss}”, and it will return again soon.`
    },
    gate: {
      locked: "Locked",
      ready: "Ready to read",
      waitingTest: "Waiting for test",
      startTest: "Start the test",
      readyLabel: "Ready to read",
      readNow: "Start reading now",
      waitingConfirm: "Waiting for confirmation",
      waitingPlan: "Waiting for plan completion",
      goResult: "Return to result",
      goPlan: "Return to plan",
      noResultMessage: "You have not completed a book-specific test yet. Test first, then decide whether any preparation is needed.",
      l1Ready: ({ title }) => `You passed the book-specific test for "${title}". The next best step is not more memorization, but beginning the reading itself.`,
      l23Ready: ({ title }) => `You finished the current minimum preparation for "${title}". Return to the real text now, and let vocabulary keep growing inside reading.`,
      l1Pending: ({ title }) => `You are already ready to read "${title}". Use the result page button to confirm and enter reading mode.`,
      l23Pending: "You finished the test, but you have not finished the minimum preparation the system assigned. The goal is not mass memorization, but clearing the words that most block this book."
    },
    units: {
      words: "words"
    }
  },
  zh: {
    modal: {
      eyebrow: "首次访问",
      title: "请选择界面语言",
      copy: "默认语言为英文。后续你也可以随时在右上角切换语言。",
      englishTitle: "English",
      englishCopy: "使用英文界面。",
      chineseTitle: "中文",
      chineseCopy: "使用中文界面。",
      note: "你的选择会保存在当前设备上。"
    },
    match: {
      too_easy: {
        label: "过于简单",
        hint: "这本书对你来说可能偏简单，可以当作放松阅读。"
      },
      just_right: {
        label: "刚刚好",
        hint: "按你目前的测试表现，这本书很适合直接尝试。"
      },
      challenge: {
        label: "略有挑战",
        hint: "需要一点准备，但仍然是值得挑战的范围。"
      },
      too_hard: {
        label: "过于难",
        hint: "按目前水平看，直接读它会比较吃力。"
      },
      unknown: {
        label: "待测后推荐",
        hint: "先完成一本到两本测试，推荐会更准确。"
      }
    },
    searchPreview: {
      noProfile: {
        eyebrow: "找书说明",
        title: "先用搜索框定位你真正想读的书",
        copy: "输入时会实时给出模糊匹配下拉推荐。点下拉项可以直接进入该书测试；按回车或点击搜索按钮，会先进入图书库结果页再选书。",
        stats: [
          ["下拉直达", "实时模糊匹配，点一下就进入该书测试。"],
          ["图书库搜索", "支持按标签、推荐词汇量和匹配度找书。"],
          ["先测后推", "测过一本到两本后，推荐颜色会更准确。"]
        ],
        quoteTitle: "当前状态",
        quoteCopy: "你还没有稳定的历史测试画像，所以系统会先给出通用推荐。完成测试后，图书库会开始按你的水平给颜色提示。"
      },
      profile: {
        eyebrow: "你的最近阅读画像",
        title: ({ estimatedVocab }) => `约 ${estimatedVocab} 词可稳定阅读`,
        copy: ({ sourceBook }) => `基于你最近一次对《${sourceBook}》的测试结果，系统会优先把更贴近你当前状态的书推到前面。`,
        levelLabel: "最近等级",
        unknownLabel: "最近未知词数",
        vocabLabel: "估算词汇量",
        quoteTitle: "如何使用颜色提示",
        quoteCopy: "白色代表更轻松，绿色代表更贴合，黄色和橙色代表挑战逐步上升，红色代表暂时偏难。你可以先去完整图书库筛选标签再挑书。"
      }
    },
    suggestions: {
      searchLibrary: ({ query }) => `在图书库搜索“${query}”`,
      searchLibraryCopy: "没有直达推荐，改为进入结果页查看更多书。",
      searchMore: "搜索更多相关书籍",
      searchMoreCopy: "进入图书库结果页，查看更多匹配结果。"
    },
    library: {
      allTags: "全部标签",
      noProfile: {
        eyebrow: "推荐状态",
        title: "还没有稳定的阅读画像",
        copy: "你现在看到的是通用图书库。完成一本到两本测试后，这里会开始显示更个性化的推荐方向和颜色提示。"
      },
      profile: {
        eyebrow: "基于你的最近测试",
        title: ({ estimatedVocab }) => `估算适读词汇量约 ${estimatedVocab} 词`,
        copy: ({ sourceBook }) => `系统会优先把更贴近你当前阅读状态的书推到前面。当前画像来自《${sourceBook}》测试。`
      },
      headingQuery: ({ query }) => `“${query}” 的相关书籍`,
      headingAll: "完整图书库",
      summaryQuery: ({ count }) => `为你找到 ${count} 本相关书。点书卡可以查看推荐强度，也可以直接进入测试。`,
      summaryAll: ({ count }) => `当前图书库共收录 ${count} 本演示书。你可以按标签、搜索词和你的最近测试水平来找书。`,
      emptyTitle: "没有匹配结果",
      emptyCopy: "试试更短的书名关键词，或者切回“全部标签”。",
      footer: ({ range, coverage }) => `推荐给词汇量约 ${range} 的读者。来源标签：${coverage}。`,
      startTest: "进入测试"
    },
    result: {
      verdicts: {
        L1: "无需背词，可直接阅读",
        L2: "建议背完全部未知词后再读",
        L3: "建议先突击高频未知词，再进入阅读"
      },
      descriptions: {
        L1: "L1（高能力）：未知词 0-5 个。现在最符合产品初衷的动作不是再去背词，而是直接开始真实阅读。",
        L2: "L2（中能力）：未知词 6-20 个。先拿下这批核心障碍词，再进入正文，会比一边读一边频繁卡住更顺滑。",
        L3: "L3（低能力）：未知词 21 个及以上。系统只保留当前最该优先解决的高频障碍词，避免回到海量死记模式。"
      },
      philosophy: {
        L1: "你已经接近开卷即读的状态，学习会在阅读中继续自然发生。",
        L2: "这里的前置学习不是为了制造更重的任务，而是为了缩短你重新回到正文的时间。",
        L3: "即使未知词较多，系统也不鼓励全量硬背，而是优先清理最妨碍理解的高频堵点。"
      },
      noneTitle: "没有明显词汇障碍",
      noneCopy: "你已经足够接近直接阅读的状态，继续背更大的词表反而偏离这个产品的初衷。",
      noPlan: "无需生成计划",
      generatePlan: "生成背诵计划",
      chapterMeta: ({ frequency, difficulty, chapter }) => `频次 ${frequency} / 难度 ${difficulty} / 第 ${chapter} 章附近。`
    },
    test: {
      difficulty: ({ difficulty }) => `难度 ${difficulty} / 5`,
      wordHint: ({ chapter, askedCount, total }) => `第 ${chapter} 章附近高频词。已测试 ${askedCount}/${total}。`,
      adaptiveNote: "认识则继续向更难处试探，不认识则回落到更容易的词位，目的是更快找到这本书的真实阅读边界。"
    },
    plan: {
      day: ({ day }) => `第 ${day} 天`,
      count: ({ count }) => `${count} 个词`,
      sliderTitle: "选择你想用多少天完成训练",
      sliderValue: ({ days }) => `${days} 天`,
      sliderHint: "每次停止拖动后，InRead 会重新计算节奏、每天词数和预计学习时长。",
      dayLabel: "训练天数",
      dailyWordLabel: "每天词数",
      timeLabel: "每日预计时长",
      summary: ({ days, dailyWords, dailyMinutes, totalMinutes }) => `按这个节奏，你大约会在 ${days} 天内完成，每天约 ${dailyWords} 个词、${dailyMinutes} 分钟，整个计划总计约 ${totalMinutes} 分钟。`,
      summaryEmpty: "拖动天数条后，这里会显示本书的节奏摘要。",
      minutes: ({ minutes }) => `${minutes} 分钟`,
      done: "已掌握",
      taskMeta: ({ chapter, frequency, difficulty }) => `第 ${chapter} 章附近 / 频次 ${frequency} / 难度 ${difficulty}`,
      startToday: "开始今天训练",
      continueToday: "继续今天训练",
      completedDay: "已完成",
      activeDay: "今日任务",
      lockedDay: "暂未解锁",
      progress: ({ done, total }) => `已掌握 ${done}/${total}`,
      rule: "每个词至少要答对 3 轮；答错的词会更快回流。",
      mapTitle: "训练日程",
      viewWords: "查看词单",
      hideWords: "收起词单"
    },
    study: {
      progress: ({ mastered, total }) => `今日已掌握 ${mastered}/${total} 个词`,
      roundsLabel: "已训练轮次",
      masteredLabel: "今日已掌握",
      leftLabel: "仍在回流",
      masteryRuleTitle: "为什么这里会重复出词",
      masteryRuleCopy: "每个词至少要通过三次正确回忆才算过关。答错的词会更快回流，所以系统会把薄弱点留在眼前，而不是把整本计划都变成海量背词。",
      questionHint: "只围绕这本书的关键障碍词训练，目标是更快回到正文。",
      typeLabels: {
        zh_to_en_choice: "中文选英文",
        en_to_zh_choice: "英文选中文",
        zh_to_en_spell: "中文拼英文",
        scene_to_en_choice: "看图选英文",
        scene_to_zh_choice: "看图选中文"
      },
      promptLabels: {
        zh_to_en_choice: "请根据中文提示，选出正确英文。",
        en_to_zh_choice: "请根据英文单词，选出最贴切的中文。",
        zh_to_en_spell: "请根据中文提示，拼写出正确英文。",
        scene_to_en_choice: "请根据视觉提示，选出对应英文。",
        scene_to_zh_choice: "请根据视觉提示，选出对应中文。"
      },
      inputPlaceholder: "输入英文单词",
      submit: "提交",
      backToPlan: "返回计划页",
      gotoGate: "查看阅读资格",
      checklistTitle: "今日清单",
      completeTitle: "今天这组词已经过关",
      completeCopy: "这一组词都已经达到最小复现次数。你可以返回计划页继续解锁后续天数，或者在整份计划结束后进入阅读资格页。",
      currentDay: ({ day }) => `第 ${day} 天训练`,
      targetBook: "目标书籍",
      sceneTitle: "视觉提示",
      sceneLabel: ({ gloss }) => `一个和“${gloss}”有关的场景`,
      correct: ({ word, gloss }) => `答对了。“${word}”对应“${gloss}”，它会暂时离开当前队列。`,
      incorrect: ({ word, gloss }) => `这次不对。“${word}”表示“${gloss}”，它会很快再次出现。`,
      spellSuccess: ({ word, gloss }) => `拼写正确。“${word}”对应“${gloss}”。`,
      spellMiss: ({ word, gloss }) => `正确拼写是“${word}”，意思是“${gloss}”，它会很快回流。`
    },
    gate: {
      locked: "锁定中",
      ready: "已可阅读",
      waitingTest: "等待测试",
      startTest: "开始测试",
      readyLabel: "可开始阅读",
      readNow: "现在就去读这本书",
      waitingConfirm: "等待确认",
      waitingPlan: "等待完成计划",
      goResult: "前往结果页确认",
      goPlan: "前往计划页打卡",
      noResultMessage: "你还没有完成针对这本书的专门测试。先测试，再决定是否需要前置学习。",
      l1Ready: ({ title }) => `你已经通过《${title}》的专书测试。现在最重要的不是继续背词，而是直接开始阅读。`,
      l23Ready: ({ title }) => `你已经完成《${title}》当前阶段的最小学习量。接下来请回到真实文本里，在阅读中继续自然吸收词汇。`,
      l1Pending: ({ title }) => `你已经有资格直接阅读《${title}》，点击结果页里的按钮即可进入阅读状态。`,
      l23Pending: "你已经完成测试，但还没有完成系统指定的最小学习量。当前目标不是海量背词，而是先解决这本书里最妨碍理解的词。"
    },
    units: {
      words: "词"
    }
  }
};

const STATIC_COPY = {
  en: {
    common: {
      text: {
        "[data-top-link='library']": "Full Library",
        "[data-top-link='search']": "Home",
        "[data-language-toggle]": "中文"
      }
    },
    search: {
      title: "InRead | Search",
      text: {
        ".brand-line": "Read the book in front of you, not a giant word list.",
        "#searchRotateEyebrow": "Tablet note",
        "#searchRotateTitle": "Please rotate to landscape",
        "#searchRotateCopy": "This prototype is optimized for 16:9 desktop screens and phone portrait layouts. If you are on a tablet, landscape will give you the full composition.",
        "#searchHeroEyebrow": "Find the right book",
        "#searchHeroLead": "InRead stands against isolated memorization. We only surface the words that truly block the book in front of you, clear the smallest useful set, and send you back into authentic reading as quickly as possible.",
        "#journeyStep1Title": "Find a book",
        "#journeyStep1Copy": "Search by title and jump straight into the matching path.",
        "#journeyStep2Title": "Check the barrier",
        "#journeyStep2Copy": "Test only the words that matter for this specific book.",
        "#journeyStep3Title": "Return to reading",
        "#journeyStep3Copy": "Use minimal prep, then learn the rest inside the text itself.",
        "#searchMiniCard1Title": "Book-specific diagnosis",
        "#searchMiniCard1Copy": "We do not estimate your whole-life vocabulary first. We ask whether you are ready for this one book.",
        "#searchMiniCard2Title": "Minimal preparation",
        "#searchMiniCard2Copy": "Only fix the words that truly interrupt comprehension, instead of rebuilding a detached word list.",
        "#searchMiniCard3Title": "Back to the text",
        "#searchMiniCard3Copy": "The real learning happens while reading, not in an endless memorization loop outside the book.",
        "#searchButton": "Search",
        "#searchFootnote": "Type to get live fuzzy suggestions. Click a suggestion to go straight into that book's test, or press Enter / Search to open the full library results page."
      },
      placeholder: {
        "#bookInput": "Type a book title, for example The Great Gatsby"
      }
    },
    library: {
      title: "InRead | Library",
      text: {
        ".brand-line": "Browse by tag, reading level, and fit.",
        "#libraryRotateEyebrow": "Tablet note",
        "#libraryRotateTitle": "Please rotate to landscape",
        "#libraryRotateCopy": "Landscape gives the library filters and recommendation cards more room. Phone portrait still works normally.",
        "#libraryHeroEyebrow": "Library",
        "#libraryFilterTitle": "Filter by tag",
        "#libraryFilterCopy": "Tags narrow the shelf quickly, while the color bar shows how well each book fits you right now.",
        "#librarySearchButton": "Search"
      },
      placeholder: {
        "#librarySearchInput": "Search by title, author, or tag"
      }
    },
    test: {
      title: "InRead | Test",
      text: {
        ".brand-line": "Read the book in front of you, not a giant word list.",
        "#testRotateEyebrow": "Tablet note",
        "#testRotateTitle": "Please rotate to landscape",
        "#testRotateCopy": "Landscape gives the test card and status panel more room. Phone portrait still works normally.",
        "#testPageEyebrow": "Readiness test",
        "#testIntro": "This page diagnoses instead of teaching. Starting from medium-difficulty book words, it quickly estimates your reading boundary through \"know\" / \"not sure\" decisions.",
        "#testStatusEyebrow": "Test status",
        "#testAskedLabel": "Answered",
        "#testKnownLabel": "Known",
        "#testUnknownLabel": "Unknown",
        "#testWhyTitle": "Why keep this page minimal?",
        "#testWhyCopy": "Because the job here is to locate friction, not to teach every word immediately. First diagnose honestly, then keep only the most valuable words for the next step.",
        "#knowButton": "I know it",
        "#dontKnowButton": "Not sure",
        "#backToSearch": "Back to search"
      }
    },
    result: {
      title: "InRead | Result",
      text: {
        ".brand-line": "Read the book in front of you, not a giant word list.",
        "#resultRotateEyebrow": "Tablet note",
        "#resultRotateTitle": "Please rotate to landscape",
        "#resultRotateCopy": "Landscape makes the result overview and unknown-word list easier to scan. Phone portrait still works normally.",
        "#resultPageEyebrow": "Recommendation result",
        "#resultTitle": "How much vocabulary friction still stands between you and this book?",
        "#resultUnknownLabel": "Unknown words in this book",
        "#resultLevelLabel": "Reading tier",
        "#resultVerdictLabel": "Current advice",
        "#resultConceptTitle": "Product principle",
        "#planButton": "Create reading plan",
        "#restartButton": "Run test again",
        "#directReadButton": "Go straight to reading access",
        "#resultListEyebrow": "Unknown-word list"
      }
    },
    plan: {
      title: "InRead | Plan",
      text: {
        ".brand-line": "Read the book in front of you, not a giant word list.",
        "#planRotateEyebrow": "Tablet note",
        "#planRotateTitle": "Please rotate to landscape",
        "#planRotateCopy": "Landscape shows more of the day-by-day checklist at once, which is better for steady review.",
        "#planPageEyebrow": "Study plan",
        "#planTitle": "Do the minimum useful prep, then return to real reading.",
        "#planLead": "This plan is not here to drag you back into mass memorization. It only targets the words that most interfere with this book, then pushes you back into the text.",
        "#planWordLabel": "Words to review",
        "#planDayLabel": "Training days",
        "#planDailyWordLabel": "Words per day",
        "#planTimeLabel": "Study time per day",
        "#planSliderTitle": "Choose how many days you want to train",
        "#planRoleTitle": "What this page is for",
        "#planRoleCopy": "It is only a bridge. Its job is to remove the most important reading barriers, not to replace reading itself.",
        "#backToResult": "Back to result",
        "#gotoGate": "View reading access",
        "#planListEyebrow": "Daily checklist"
      }
    },
    study: {
      title: "InRead | Trainer",
      text: {
        ".brand-line": "Read the book in front of you, not a giant word list.",
        "#studyRotateEyebrow": "Tablet note",
        "#studyRotateTitle": "Please rotate to landscape",
        "#studyRotateCopy": "Landscape gives the trainer prompt, choices, and progress panel more room. Phone portrait still works normally.",
        "#studyPageEyebrow": "Vocabulary trainer",
        "#studyStatusEyebrow": "Training status"
      },
      placeholder: {
        "#studySpellInput": "Type the English word"
      }
    },
    gate: {
      title: "InRead | Reading Access",
      text: {
        ".brand-line": "Read the book in front of you, not a giant word list.",
        "#gateRotateEyebrow": "Tablet note",
        "#gateRotateTitle": "Please rotate to landscape",
        "#gateRotateCopy": "Landscape makes the reading-access state and explanation cards easier to inspect. Phone portrait still works normally.",
        "#gatePageEyebrow": "Reading access",
        "#gateStageLabel": "Current stage",
        "#gateNextActionLabel": "Next action",
        "#gateBookStatLabel": "Target book",
        "#gatePrincipleTitle": "Product principle",
        "#gatePrincipleCopy": "We are not trying to build another digital word book. We want the smallest possible preparation that sends readers back into the original text, where vocabulary can keep growing naturally.",
        "#backToSearch": "Choose another book",
        "#backToPlan": "Back to plan",
        "#gateGuideEyebrow": "Reading-state guide",
        "#gateL1Copy": "Very few unknown words. Reading access is granted directly, and the real learning continues inside the book.",
        "#gateL2Copy": "Not many unknown words. Clear them first, then enter the text with smoother comprehension.",
        "#gateL3Copy": "Focus on the high-frequency blockers first. Let the lower-frequency words be learned through reading instead of returning to mass memorization."
      }
    }
  },
  zh: {
    common: {
      text: {
        "[data-top-link='library']": "完整图书库",
        "[data-top-link='search']": "返回首页",
        "[data-language-toggle]": "EN"
      }
    },
    search: {
      title: "InRead | 找书",
      text: {
        ".brand-line": "不背海量词，只读眼前书",
        "#searchRotateEyebrow": "平板使用提示",
        "#searchRotateTitle": "建议旋转到横屏",
        "#searchRotateCopy": "这个版本优先为 16:9 桌面展示和手机纵向阅读设计。若你现在使用平板，横屏会获得更完整的布局。",
        "#searchHeroEyebrow": "找到目标书",
        "#searchHeroLead": "InRead 不再要求用户先背一大本和当下阅读无关的词表。我们只关心眼前这一本书里真正会挡路的词，先测出障碍，再做最小量准备，然后把学习放回真实阅读现场里完成。",
        "#journeyStep1Title": "找到目标书",
        "#journeyStep1Copy": "先定位你真正想读的那一本到两本书。",
        "#journeyStep2Title": "判断障碍词",
        "#journeyStep2Copy": "只测试这本书里真正会挡住理解的词。",
        "#journeyStep3Title": "回到阅读中",
        "#journeyStep3Copy": "做完最小量准备后，马上回到文本本身。",
        "#searchMiniCard1Title": "专书诊断",
        "#searchMiniCard1Copy": "不是测你的全局词汇量，而是判断你是否准备好读懂这一本书。",
        "#searchMiniCard2Title": "最小预备学习",
        "#searchMiniCard2Copy": "只解决当前书里真正妨碍理解的词，避免回到孤立背词的旧模式。",
        "#searchMiniCard3Title": "回到文本本身",
        "#searchMiniCard3Copy": "真正有效的学习发生在阅读过程里，而不是发生在书外的海量死记里。",
        "#searchButton": "开始诊断",
        "#searchFootnote": "输入时会实时下拉推荐，点推荐项可直接进该书测试；按回车或点击按钮，则进入图书库结果页继续选书。"
      },
      placeholder: {
        "#bookInput": "输入英文书名，例如 The Great Gatsby"
      }
    },
    library: {
      title: "InRead | 图书库",
      text: {
        ".brand-line": "按标签、词汇量与匹配度找书",
        "#libraryRotateEyebrow": "平板使用提示",
        "#libraryRotateTitle": "建议旋转到横屏",
        "#libraryRotateCopy": "横屏时图书库筛选和书卡信息会更完整。手机纵向也可以正常找书。",
        "#libraryHeroEyebrow": "图书库",
        "#libraryFilterTitle": "按标签筛选",
        "#libraryFilterCopy": "标签是为了更快缩小范围，颜色条则是为了告诉你它对你来说有多合适。",
        "#librarySearchButton": "搜索"
      },
      placeholder: {
        "#librarySearchInput": "搜索书名、作者或标签"
      }
    },
    test: {
      title: "InRead | 测试",
      text: {
        ".brand-line": "不背海量词，只读眼前书",
        "#testRotateEyebrow": "平板使用提示",
        "#testRotateTitle": "建议旋转到横屏",
        "#testRotateCopy": "横屏时测试词卡和状态卡会更完整。手机纵向仍可正常使用。",
        "#testPageEyebrow": "阅读资格测试",
        "#testIntro": "这一页只做判断，不直接教学。系统从书内中位难度词开始，通过“认识 / 不认识”快速定位你的阅读边界。",
        "#testStatusEyebrow": "测试状态",
        "#testAskedLabel": "已作答",
        "#testKnownLabel": "已知词",
        "#testUnknownLabel": "未知词",
        "#testWhyTitle": "为什么这一页坚持极简？",
        "#testWhyCopy": "因为这里的任务是定位障碍，不是立刻教会所有词。先诚实判断，再把最值得学的词留到下一页。",
        "#knowButton": "认识",
        "#dontKnowButton": "不认识 / 模糊",
        "#backToSearch": "返回找书页"
      }
    },
    result: {
      title: "InRead | 结果",
      text: {
        ".brand-line": "不背海量词，只读眼前书",
        "#resultRotateEyebrow": "平板使用提示",
        "#resultRotateTitle": "建议旋转到横屏",
        "#resultRotateCopy": "横屏时结果概览和未知词列表会更清晰。手机纵向仍可正常查看。",
        "#resultPageEyebrow": "结果判定",
        "#resultTitle": "你和这本书之间，还差多少词汇障碍？",
        "#resultUnknownLabel": "本书未知词数",
        "#resultLevelLabel": "建议等级",
        "#resultVerdictLabel": "当前建议",
        "#resultConceptTitle": "理念说明",
        "#planButton": "创建阅读计划",
        "#restartButton": "重新测试",
        "#directReadButton": "直接进入阅读资格页",
        "#resultListEyebrow": "未知词列表"
      }
    },
    plan: {
      title: "InRead | 计划",
      text: {
        ".brand-line": "不背海量词，只读眼前书",
        "#planRotateEyebrow": "平板使用提示",
        "#planRotateTitle": "建议旋转到横屏",
        "#planRotateCopy": "横屏时每日清单能一次看到更多内容，适合连续打卡。",
        "#planPageEyebrow": "背诵计划",
        "#planTitle": "先做最小量准备，再回到真实阅读。",
        "#planLead": "这份计划不是为了把你重新拉回海量背词，而是只处理当前书里最妨碍理解的词。完成后，目标是尽快重新回到原书。",
        "#planWordLabel": "待学词数",
        "#planDayLabel": "训练天数",
        "#planDailyWordLabel": "每天词数",
        "#planTimeLabel": "每日预计时长",
        "#planSliderTitle": "选择你想用多少天完成训练",
        "#planRoleTitle": "这页的角色",
        "#planRoleCopy": "它只是一个过渡页，负责帮你清掉最关键的阅读障碍，而不是取代阅读本身。",
        "#backToResult": "返回结果页",
        "#gotoGate": "查看阅读资格",
        "#planListEyebrow": "每日清单"
      }
    },
    study: {
      title: "InRead | 训练",
      text: {
        ".brand-line": "不背海量词，只读眼前书",
        "#studyRotateEyebrow": "平板使用提示",
        "#studyRotateTitle": "建议旋转到横屏",
        "#studyRotateCopy": "横屏时训练卡、选项区和进度栏会更完整。手机纵向仍可正常使用。",
        "#studyPageEyebrow": "背词训练",
        "#studyStatusEyebrow": "训练状态"
      },
      placeholder: {
        "#studySpellInput": "输入英文单词"
      }
    },
    gate: {
      title: "InRead | 阅读资格",
      text: {
        ".brand-line": "不背海量词，只读眼前书",
        "#gateRotateEyebrow": "平板使用提示",
        "#gateRotateTitle": "建议旋转到横屏",
        "#gateRotateCopy": "横屏时阅读资格状态和解释卡会更完整。手机纵向同样可以使用。",
        "#gatePageEyebrow": "阅读资格",
        "#gateStageLabel": "当前阶段",
        "#gateNextActionLabel": "下一步动作",
        "#gateBookStatLabel": "目标书籍",
        "#gatePrincipleTitle": "产品初衷",
        "#gatePrincipleCopy": "我们不是想制造另一本电子单词书，而是用最少的前置准备，把用户尽快送回原书里，在真实语境中继续习得词汇。",
        "#backToSearch": "重新选书",
        "#backToPlan": "返回计划页",
        "#gateGuideEyebrow": "阅读状态说明",
        "#gateL1Copy": "未知词极少，直接授予阅读资格。真正的学习将在阅读中继续发生。",
        "#gateL2Copy": "未知词不多，值得先解决，再带着更顺滑的理解进入正文。",
        "#gateL3Copy": "先突击高频障碍词，低频词允许在阅读中边查边学，避免回到海量死记模式。"
      }
    }
  }
};

let currentLanguage = DEFAULT_LANGUAGE;
let currentTheme = "light";
let easterEggUnlocked = false;
let themeClickStreak = 0;

const SEARCH_HERO_TITLE_LINES = {
  en: [
    "Natural vocabulary growth",
    "starts inside real reading."
  ],
  zh: [
    "反对孤立背单词",
    "从真实阅读里自然习得"
  ]
};

document.addEventListener("DOMContentLoaded", async () => {
  await window.InReadAccount?.ready;
  const page = document.body.dataset.page;
  currentLanguage = getStoredLanguage() || DEFAULT_LANGUAGE;
  const appearance = window.InReadAccount?.getUser?.()?.profile?.appearance;
  easterEggUnlocked = Boolean(appearance?.easterEggUnlocked || getStoredThemeUnlocked());
  currentTheme = isThemeAvailable(appearance?.theme, easterEggUnlocked)
    ? appearance.theme
    : (isThemeAvailable(getStoredTheme(), easterEggUnlocked) ? getStoredTheme() : getSystemTheme());
  applyTheme(currentTheme);
  syncViewportProfile();
  applyStaticCopy(page);
  renderPageDecorations(page);
  bindLanguageControls();
  renderThemeControls();
  bindThemeControls();
  renderGlobalNav(page);

  if (page === "search") initSearchPage();
  if (page === "library") initLibraryPage();
  if (page === "test") initTestPage();
  if (page === "result") initResultPage();
  if (page === "plan") initPlanPage();
  if (page === "study") initStudyPage();
  if (page === "gate") initGatePage();

  if (!getStoredLanguage()) showLanguageModal();
});

window.addEventListener("resize", syncViewportProfile, { passive: true });

function renderStepper(currentPage) {
  void currentPage;
}

function renderGlobalNav(currentPage) {
  document.querySelectorAll("[data-top-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.topLink === currentPage);
  });
}

function getStoredLanguage() {
  try {
    return globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function setStoredLanguage(language) {
  try {
    globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    void language;
  }
}

function getStoredTheme() {
  try {
    const stored = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    return ALL_THEMES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function getStoredThemeUnlocked() {
  try {
    return globalThis.localStorage?.getItem(THEME_EGG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function isThemeAvailable(theme, unlocked) {
  return BASE_THEMES.includes(theme) || (theme === "aurora" && unlocked);
}

function getSystemTheme() {
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
}

function setStoredTheme(theme) {
  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    void theme;
  }
}

function persistThemePreference(theme, unlocked) {
  setStoredTheme(theme);
  try {
    globalThis.localStorage?.setItem(THEME_EGG_STORAGE_KEY, unlocked ? "1" : "0");
  } catch {
    void unlocked;
  }
  fetch("/api/profile", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ appearance: { theme, easterEggUnlocked: unlocked } })
  }).catch(() => {});
}

function getCopy() {
  return COPY[currentLanguage] || COPY.en;
}

function getLocalizedMap(map) {
  return map[currentLanguage] || map.en;
}

function translate(template, params = {}) {
  if (typeof template === "function") return template(params);
  return String(template).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

function getLibraryMatchMeta(key) {
  const pack = getLocalizedMap(LIBRARY_MATCH_META);
  return pack[key] || pack.unknown;
}

function getReadinessMeta(key) {
  const pack = getLocalizedMap(READINESS_META);
  return pack[key] || pack.not_recommended;
}

function getResultActionCopy() {
  return getLocalizedMap(RESULT_ACTION_COPY);
}

function applyStaticCopy(page) {
  const languagePack = STATIC_COPY[currentLanguage] || STATIC_COPY.en;
  const commonPack = languagePack.common || {};
  const pagePack = languagePack[page] || {};

  if (pagePack.title) document.title = pagePack.title;
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  applyTextMap(commonPack.text);
  applyTextMap(pagePack.text);
  applyPlaceholderMap(pagePack.placeholder);
}

function applyTextMap(map = {}) {
  Object.entries(map).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  });
}

function applyPlaceholderMap(map = {}) {
  Object.entries(map).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.setAttribute("placeholder", value);
    });
  });
}

function renderPageDecorations(page) {
  if (page === "search") renderSearchHeroTitle();
}

function renderSearchHeroTitle() {
  const title = document.getElementById("searchHeroTitle");
  if (!title) return;

  const lines = SEARCH_HERO_TITLE_LINES[currentLanguage] || SEARCH_HERO_TITLE_LINES.en;
  title.classList.remove("is-en", "is-zh");
  title.classList.add(currentLanguage === "zh" ? "is-zh" : "is-en");
  title.innerHTML = lines.map((line, index) => `
    <span class="hero-title-line ${index === 0 ? "hero-title-line-first" : "hero-title-line-shift"}">${escapeHtml(line)}</span>
  `).join("");
}

function bindLanguageControls() {
  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = currentLanguage === "en" ? "zh" : "en";
      setStoredLanguage(nextLanguage);
      window.location.reload();
    });
  });
}

function renderThemeControls() {
  document.querySelectorAll("[data-language-toggle]").forEach((languageButton) => {
    if (languageButton.parentElement?.querySelector("[data-theme-toggle]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "top-link theme-toggle";
    button.dataset.themeToggle = "true";
    button.dataset.themeChoice = currentTheme;
    button.setAttribute("aria-label", "切换网站主题");
    button.title = "切换网站主题";
    button.innerHTML = '<span class="theme-dot" aria-hidden="true"></span>';
    languageButton.insertAdjacentElement("afterend", button);
  });
}

function bindThemeControls() {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      themeClickStreak += 1;
      const justUnlocked = !easterEggUnlocked && themeClickStreak >= 10;
      easterEggUnlocked = easterEggUnlocked || justUnlocked;
      const themes = easterEggUnlocked ? ALL_THEMES : BASE_THEMES;
      const nextTheme = justUnlocked ? "aurora" : themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      applyTheme(nextTheme);
      persistThemePreference(nextTheme, easterEggUnlocked);
      button.dataset.themeChoice = nextTheme;
      if (justUnlocked) showThemeEasterNotice();
    });
  });
}

function showThemeEasterNotice() {
  if (document.querySelector(".theme-easter-toast")) return;
  const toast = document.createElement("div");
  toast.className = "theme-easter-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = '<strong>恭喜你触发彩蛋</strong><span>现在可以切换彩蛋背景。</span><button type="button" aria-label="关闭提示">×</button>';
  toast.querySelector("button").addEventListener("click", () => toast.remove());
  document.body.appendChild(toast);
}

function showLanguageModal() {
  const modalCopy = getCopy().modal;
  const backdrop = document.createElement("div");
  backdrop.className = "language-modal-backdrop";
  backdrop.innerHTML = `
    <div class="language-modal">
      <span class="eyebrow">${escapeHtml(modalCopy.eyebrow)}</span>
      <h3>${escapeHtml(modalCopy.title)}</h3>
      <p class="language-modal-copy">${escapeHtml(modalCopy.copy)}</p>
      <div class="language-option-row">
        <button type="button" class="language-option is-default" data-language-choice="en">
          <strong>${escapeHtml(modalCopy.englishTitle)}</strong>
          <span>${escapeHtml(modalCopy.englishCopy)}</span>
        </button>
        <button type="button" class="language-option" data-language-choice="zh">
          <strong>${escapeHtml(modalCopy.chineseTitle)}</strong>
          <span>${escapeHtml(modalCopy.chineseCopy)}</span>
        </button>
      </div>
      <p class="language-modal-note">${escapeHtml(modalCopy.note)}</p>
    </div>
  `;

  backdrop.querySelectorAll("[data-language-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      setStoredLanguage(button.dataset.languageChoice);
      window.location.reload();
    });
  });

  document.body.appendChild(backdrop);
}

function syncViewportProfile() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = width / Math.max(height, 1);
  // A 16:9 frame becomes vertically constrained on 16:10, 3:2, and short
  // desktop displays. Let plan-like pages use one predictable page scrollbar.
  const needsDocumentScroll = width >= 768 && (ratio < 1.68 || height < 820);
  let profile = "desktop-standard";

  if (width < 768) {
    profile = "phone";
  } else if (width < 1180 && height > width) {
    profile = "tablet-portrait";
  } else if (width >= 1100 && height <= 780) {
    profile = "desktop-compact";
  } else if (ratio >= 1.9) {
    profile = "desktop-cinema";
  }

  document.body.dataset.viewportProfile = profile;
  document.body.dataset.autoScroll = needsDocumentScroll ? "true" : "false";
}

function defaultState() {
  return {
    selectedBook: null,
    orderedWords: [],
    currentIndex: null,
    visitedWords: [],
    knownWords: [],
    unknownWords: [],
    result: null,
    plan: [],
    planDays: 7,
    completion: [],
    studySession: null,
    wordRecords: {},
    planProgress: {},
    trainingDay: 0,
    gateUnlocked: false,
    directChallenge: false,
    readerProfile: null,
    searchQuery: "",
    libraryFilterTag: "all"
  };
}

function getState() {
  const raw = sessionStorage.getItem("inread-state");
  if (!raw) return defaultState();
  try {
    const parsed = { ...defaultState(), ...JSON.parse(raw) };
    if (parsed.result) {
      parsed.result = normalizeResult(parsed.result);
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

function setState(state) {
  const nextState = { ...state };
  if (nextState.result) {
    nextState.result = normalizeResult(nextState.result);
  }
  sessionStorage.setItem("inread-state", JSON.stringify(nextState));
  window.InReadAccount?.saveState(nextState);
}

function normalizeResult(result) {
  if (!result) return result;
  const normalized = { ...result };
  normalized.level = normalized.level || (normalized.unknownCount <= 5 ? "L1" : normalized.unknownCount <= 20 ? "L2" : "L3");
  normalized.tierKey = normalized.tierKey || getReadinessTierKey(normalized.unknownCount || 0);
  normalized.tierCode = getReadinessMeta(normalized.tierKey).code;
  normalized.verdict = getReadinessMeta(normalized.tierKey).label;
  return normalized;
}

function go(page, params = {}) {
  const filteredEntries = Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  const query = new URLSearchParams(filteredEntries).toString();
  const target = `${page}.html${query ? `?${query}` : ""}`;
  const navigate = () => { window.location.href = target; };
  const flushState = window.InReadAccount?.flushState;

  // The next legacy page hydrates from the account record, so save before leaving.
  if (flushState) {
    flushState(getState()).finally(navigate);
  } else {
    navigate();
  }
}

function createFreshState(book, currentState = getState()) {
  const orderedWords = [...book.vocabulary].sort((a, b) => a.difficulty - b.difficulty || b.frequency - a.frequency);
  return {
    ...currentState,
    selectedBook: book,
    orderedWords,
    currentIndex: Math.floor(orderedWords.length / 2),
    visitedWords: [],
    knownWords: [],
    unknownWords: [],
    result: null,
    plan: [],
    planDays: 7,
    completion: [],
    studySession: null,
    wordRecords: {},
    planProgress: {},
    trainingDay: 0,
    gateUnlocked: false,
    directChallenge: false
  };
}

function initSearchPage() {
  const input = document.getElementById("bookInput");
  const preview = document.getElementById("bookPreview");
  const chips = document.getElementById("sampleChips");
  const dropdown = document.getElementById("searchSuggestions");
  const state = ensureReaderProfile(getState());

  bindSearchPageWheel();
  renderSampleChips(chips);
  renderSearchPreview(preview, state);
  setupSearchAutocomplete({
    input,
    dropdown,
    onDirectSelect: (book) => startBookTest(book),
    onSearch: (query) => openLibrarySearch(query)
  });

  document.getElementById("searchButton").addEventListener("click", () => {
    openLibrarySearch(input.value.trim());
  });
}

function bindSearchPageWheel() {
  const frame = document.querySelector(".frame");
  const leftPanel = document.querySelector(".hero-card");
  if (!frame || !leftPanel || frame.dataset.wheelBound === "true") return;

  frame.dataset.wheelBound = "true";
  frame.addEventListener("wheel", (event) => {
    if (!leftPanel || leftPanel.scrollHeight <= leftPanel.clientHeight) return;
    if (event.target instanceof Element && event.target.closest("input, button, a, textarea, .search-suggestions")) return;

    event.preventDefault();
    leftPanel.scrollTop += event.deltaY;
  }, { passive: false });
}

function initLibraryPage() {
  const state = ensureReaderProfile(getState());
  const params = new URLSearchParams(window.location.search);
  const input = document.getElementById("librarySearchInput");
  const dropdown = document.getElementById("librarySuggestions");
  const results = document.getElementById("libraryResults");
  const heading = document.getElementById("libraryHeading");
  const summary = document.getElementById("librarySummary");
  const filters = document.getElementById("tagFilters");
  const profileCard = document.getElementById("libraryProfileCard");

  const query = params.has("q") ? (params.get("q") || "") : "";
  const activeTag = params.has("tag") ? (params.get("tag") || "all") : "all";

  state.searchQuery = query;
  state.libraryFilterTag = activeTag;
  setState(state);

  input.value = query;
  renderLibraryProfile(profileCard, state.readerProfile);
  renderTagFilters(filters, activeTag, query);
  renderLibraryResults({ query, activeTag, heading, summary, results, readerProfile: state.readerProfile });

  setupSearchAutocomplete({
    input,
    dropdown,
    onDirectSelect: (book) => startBookTest(book),
    onSearch: (nextQuery) => {
      const nextState = getState();
      nextState.searchQuery = nextQuery;
      nextState.libraryFilterTag = activeTag;
      setState(nextState);
      go("library", { q: nextQuery, tag: activeTag !== "all" ? activeTag : "" });
    }
  });

  document.getElementById("librarySearchButton").addEventListener("click", () => {
    const nextQuery = input.value.trim();
    const nextState = getState();
    nextState.searchQuery = nextQuery;
    setState(nextState);
    go("library", { q: nextQuery, tag: activeTag !== "all" ? activeTag : "" });
  });
}

function initTestPage() {
  const state = getState();
  if (!state.selectedBook || !state.orderedWords.length) {
    go("search");
    return;
  }

  if (state.result) {
    go("result");
    return;
  }

  document.getElementById("testBookTitle").textContent = state.selectedBook.title;
  document.getElementById("backToSearch").addEventListener("click", () => go("search"));
  document.getElementById("knowButton").addEventListener("click", () => answerWord(true));
  document.getElementById("dontKnowButton").addEventListener("click", () => answerWord(false));
  renderTest();
}

function initResultPage() {
  let state = getState();
  if (!state.selectedBook || !state.result) {
    go("search");
    return;
  }

  state = ensureReaderProfile(state);
  renderResult(state);

  document.getElementById("restartButton").addEventListener("click", () => {
    setState(createFreshState(state.selectedBook, getState()));
    go("test");
  });
  document.getElementById("planButton").addEventListener("click", generatePlanFromResult);
  document.getElementById("directReadButton").addEventListener("click", handleDirectReadAction);
}

function initPlanPage() {
  const state = normalizeStudyState(getState());
  if (!state.selectedBook || !state.result) {
    go("search");
    return;
  }
  if (!shouldOfferPlan(state.result)) {
    go("result");
    return;
  }

  if (isStudyInProgress(state)) {
    renderPlanBlocked();
    return;
  }

  if (!state.plan.length) ensurePlanForDays(state.planDays || 7);
  renderPlan();
  bindPlanConfigurator();
  document.getElementById("backToResult").addEventListener("click", () => go("result"));
  document.getElementById("gotoGate").addEventListener("click", () => go("gate"));
  document.getElementById("planGrid").addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-start-day]") : null;
    if (!button) return;
    startStudyDay(Number(button.dataset.startDay));
  });
  document.getElementById("startTodayStudy")?.addEventListener("click", () => {
    const activeDay = getActivePlanDay(getState());
    if (activeDay) startStudyDay(activeDay);
  });
}

function initStudyPage() {
  const state = normalizeStudyState(getState());
  if (!state.selectedBook || !state.result || !state.plan.length) {
    go("plan");
    return;
  }

  if (!state.studySession || state.studySession.bookId !== state.selectedBook.id || state.studySession.version !== STUDY_ENGINE_VERSION) {
    const activeDay = getActivePlanDay(state);
    if (!activeDay) {
      go("gate");
      return;
    }
    startStudyDay(activeDay, { navigate: false });
  }

  renderStudy();
}

function initGatePage() {
  const state = getState();
  if (!state.selectedBook) {
    go("search");
    return;
  }

  renderGate();
  document.getElementById("backToSearch").addEventListener("click", () => go("search"));
  const backToPlan = document.getElementById("backToPlan");
  if (state.plan.length && state.result && state.result.level !== "L1") {
    backToPlan.classList.remove("hidden");
    backToPlan.addEventListener("click", () => go("plan"));
  }
}

function renderSampleChips(container) {
  buildBooks().slice(0, 5).forEach((book) => {
    const button = document.createElement("button");
    button.className = "pill-btn";
    button.type = "button";
    button.textContent = book.title;
    button.addEventListener("click", () => startBookTest(book));
    container.appendChild(button);
  });
}

function renderSearchPreview(container, state) {
  const previewCopy = getCopy().searchPreview;

  if (!state.readerProfile) {
    const [firstStat, secondStat, thirdStat] = previewCopy.noProfile.stats;
    container.innerHTML = `
      <span class="eyebrow">${escapeHtml(previewCopy.noProfile.eyebrow)}</span>
      <h3 style="margin-top: 16px;">${escapeHtml(previewCopy.noProfile.title)}</h3>
      <p class="lead compact">${escapeHtml(previewCopy.noProfile.copy)}</p>
      <div class="stats-grid">
        <div class="stat-box"><strong>${escapeHtml(firstStat[0])}</strong><span>${escapeHtml(firstStat[1])}</span></div>
        <div class="stat-box"><strong>${escapeHtml(secondStat[0])}</strong><span>${escapeHtml(secondStat[1])}</span></div>
        <div class="stat-box"><strong>${escapeHtml(thirdStat[0])}</strong><span>${escapeHtml(thirdStat[1])}</span></div>
      </div>
      <div class="quote-box" style="margin-top: 18px;">
        <strong>${escapeHtml(previewCopy.noProfile.quoteTitle)}</strong>
        <p class="word-meta">${escapeHtml(previewCopy.noProfile.quoteCopy)}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <span class="eyebrow">${escapeHtml(previewCopy.profile.eyebrow)}</span>
    <h3 style="margin-top: 16px;">${escapeHtml(translate(previewCopy.profile.title, { estimatedVocab: state.readerProfile.estimatedVocab }))}</h3>
    <p class="lead compact">${escapeHtml(translate(previewCopy.profile.copy, { sourceBook: state.readerProfile.sourceBook }))}</p>
    <div class="stats-grid">
      <div class="stat-box"><strong>${state.readerProfile.sourceLevel}</strong><span>${escapeHtml(previewCopy.profile.levelLabel)}</span></div>
      <div class="stat-box"><strong>${state.readerProfile.unknownCount}</strong><span>${escapeHtml(previewCopy.profile.unknownLabel)}</span></div>
      <div class="stat-box"><strong>${state.readerProfile.estimatedVocab}</strong><span>${escapeHtml(previewCopy.profile.vocabLabel)}</span></div>
    </div>
    <div class="quote-box" style="margin-top: 18px;">
      <strong>${escapeHtml(previewCopy.profile.quoteTitle)}</strong>
      <p class="word-meta">${escapeHtml(previewCopy.profile.quoteCopy)}</p>
    </div>
  `;
}

function setupSearchAutocomplete({ input, dropdown, onDirectSelect, onSearch }) {
  const closeDropdown = () => dropdown.classList.add("hidden");

  input.addEventListener("input", () => {
    const query = input.value.trim();
    renderSearchSuggestions(dropdown, query, onDirectSelect, onSearch);
  });

  input.addEventListener("focus", () => {
    const query = input.value.trim();
    if (query) {
      renderSearchSuggestions(dropdown, query, onDirectSelect, onSearch);
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      closeDropdown();
      onSearch(input.value.trim());
    }
    if (event.key === "Escape") {
      closeDropdown();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && event.target !== input) {
      closeDropdown();
    }
  });
}

function renderSearchSuggestions(dropdown, query, onDirectSelect, onSearch) {
  if (!query) {
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
    return;
  }

  const matches = searchBooks(query).slice(0, SUGGESTION_LIMIT);
  dropdown.innerHTML = "";

  if (!matches.length) {
    const suggestionCopy = getCopy().suggestions;
    const empty = document.createElement("button");
    empty.type = "button";
    empty.className = "search-suggestion search-suggestion-cta";
    empty.innerHTML = `<strong>${escapeHtml(translate(suggestionCopy.searchLibrary, { query }))}</strong><span>${escapeHtml(suggestionCopy.searchLibraryCopy)}</span>`;
    empty.addEventListener("click", () => onSearch(query));
    dropdown.appendChild(empty);
    dropdown.classList.remove("hidden");
    return;
  }

  matches.forEach((book) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "search-suggestion";
    item.innerHTML = `
      <div class="search-suggestion-main">
        <strong>${escapeHtml(book.title)}</strong>
        <span>${escapeHtml(book.author)}</span>
      </div>
      <div class="search-suggestion-side">
        <span>${escapeHtml(formatVocabRange(book.recommendedRange))}</span>
        <div class="tag-inline-row">${book.tags.slice(0, 2).map((tag) => `<span class="mini-tag">${escapeHtml(translateTag(tag))}</span>`).join("")}</div>
      </div>
    `;
    item.addEventListener("click", () => onDirectSelect(book));
    dropdown.appendChild(item);
  });

  const cta = document.createElement("button");
  cta.type = "button";
  cta.className = "search-suggestion search-suggestion-cta";
  cta.innerHTML = `<strong>${escapeHtml(getCopy().suggestions.searchMore)}</strong><span>${escapeHtml(getCopy().suggestions.searchMoreCopy)}</span>`;
  cta.addEventListener("click", () => onSearch(query));
  dropdown.appendChild(cta);

  dropdown.classList.remove("hidden");
}

function openLibrarySearch(query) {
  const nextState = getState();
  nextState.searchQuery = query;
  nextState.libraryFilterTag = "all";
  setState(nextState);
  go("library", query ? { q: query } : {});
}

function startBookTest(book) {
  const state = createFreshState(book, getState());
  setState(state);
  go("test");
}

function translateTag(tag) {
  const labels = TAG_LABELS[tag];
  if (!labels) return tag;
  return labels[currentLanguage] || labels.en || tag;
}

function getBookBlurb(book) {
  return BOOK_COPY[book.id]?.[currentLanguage]?.blurb || book.blurb;
}

function getBookCoverage(book) {
  return BOOK_COPY[book.id]?.[currentLanguage]?.coverage || book.coverage;
}

function renderTagFilters(container, activeTag, query) {
  const libraryCopy = getCopy().library;
  const tags = ["all", ...collectAllTags()];
  container.innerHTML = tags.map((tag) => {
    const label = tag === "all" ? libraryCopy.allTags : translateTag(tag);
    return `
      <button
        type="button"
        class="filter-chip ${tag === activeTag ? "active" : ""}"
        data-tag="${escapeHtml(tag)}"
      >
        ${escapeHtml(label)}
      </button>
    `;
  }).join("");

  container.querySelectorAll("[data-tag]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTag = button.dataset.tag;
      const state = getState();
      state.libraryFilterTag = nextTag;
      setState(state);
      go("library", {
        q: query || "",
        tag: nextTag !== "all" ? nextTag : ""
      });
    });
  });
}

function renderLibraryProfile(container, profile) {
  const libraryCopy = getCopy().library;
  if (!profile) {
    container.innerHTML = `
      <span class="eyebrow">${escapeHtml(libraryCopy.noProfile.eyebrow)}</span>
      <h3 style="margin-top: 16px;">${escapeHtml(libraryCopy.noProfile.title)}</h3>
      <p class="lead compact">${escapeHtml(libraryCopy.noProfile.copy)}</p>
    `;
    return;
  }

  container.innerHTML = `
    <span class="eyebrow">${escapeHtml(libraryCopy.profile.eyebrow)}</span>
    <h3 style="margin-top: 16px;">${escapeHtml(translate(libraryCopy.profile.title, { estimatedVocab: profile.estimatedVocab }))}</h3>
    <p class="lead compact">${escapeHtml(translate(libraryCopy.profile.copy, { sourceBook: profile.sourceBook }))}</p>
  `;
}

function renderLibraryResults({ query, activeTag, heading, summary, results, readerProfile }) {
  const libraryCopy = getCopy().library;
  const visibleBooks = getVisibleBooks(query, activeTag, readerProfile);

  heading.textContent = query
    ? translate(libraryCopy.headingQuery, { query })
    : libraryCopy.headingAll;
  summary.textContent = query
    ? translate(libraryCopy.summaryQuery, { count: visibleBooks.length })
    : translate(libraryCopy.summaryAll, { count: buildBooks().length });

  if (!visibleBooks.length) {
    results.innerHTML = `
      <div class="empty-state">
        <strong>${escapeHtml(libraryCopy.emptyTitle)}</strong>
        <span>${escapeHtml(libraryCopy.emptyCopy)}</span>
      </div>
    `;
    return;
  }

  results.innerHTML = visibleBooks.map((book) => renderLibraryCard(book, readerProfile)).join("");
  results.querySelectorAll("[data-book-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const book = buildBooks().find((item) => item.id === button.dataset.bookId);
      if (book) startBookTest(book);
    });
  });
}

function renderLibraryCard(book, readerProfile) {
  const match = getBookMatch(book, readerProfile);
  return `
    <article class="library-card">
      <div class="library-card-top">
        <div>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="word-meta">${escapeHtml(book.author)} / ${escapeHtml(getBookBlurb(book))}</p>
        </div>
        <span class="library-vocab">${escapeHtml(formatVocabRange(book.recommendedRange))}</span>
      </div>

      <div class="tag-row">
        ${book.tags.map((tag) => `<span class="tag-chip">${escapeHtml(translateTag(tag))}</span>`).join("")}
      </div>

      <div class="match-panel">
        <div class="match-copy">
          <strong>${match.label}</strong>
          <span>${match.hint}</span>
        </div>
        <div class="match-bar">
          <div class="match-fill ${match.fillClass}"></div>
        </div>
      </div>

      <div class="library-card-bottom">
        <div class="word-meta">${escapeHtml(translate(getCopy().library.footer, { range: formatVocabRange(book.recommendedRange), coverage: getBookCoverage(book) }))}</div>
        <button class="primary-btn" type="button" data-book-id="${escapeHtml(book.id)}">${escapeHtml(getCopy().library.startTest)}</button>
      </div>
    </article>
  `;
}

function getVisibleBooks(query, activeTag, readerProfile) {
  const normalizedQuery = normalizeText(query);
  const books = buildBooks()
    .filter((book) => activeTag === "all" || book.tags.includes(activeTag))
    .filter((book) => !normalizedQuery || scoreBook(book, normalizedQuery) > 0)
    .sort((a, b) => {
      const queryDelta = scoreBook(b, normalizedQuery) - scoreBook(a, normalizedQuery);
      if (queryDelta !== 0) return queryDelta;
      const matchDelta = getBookMatchScore(b, readerProfile) - getBookMatchScore(a, readerProfile);
      if (matchDelta !== 0) return matchDelta;
      return a.recommendedRange[0] - b.recommendedRange[0];
    });

  return books;
}

function getBookMatch(book, readerProfile) {
  const key = getBookMatchKey(book, readerProfile);
  const matchCopy = getLibraryMatchMeta(key);
  return {
    key,
    label: matchCopy.label,
    hint: matchCopy.hint,
    fillClass: MATCH_FILL_CLASS[key]
  };
}

function getBookMatchScore(book, readerProfile) {
  const matchKey = getBookMatchKey(book, readerProfile);
  if (matchKey === "recommended") return 6;
  if (matchKey === "stretch") return 5;
  if (matchKey === "warmup") return 4;
  if (matchKey === "demanding") return 3;
  if (matchKey === "relaxed") return 2;
  if (matchKey === "not_yet") return 1;
  return 0;
}

function getBookMatchKey(book, readerProfile) {
  if (!readerProfile) return "unknown";

  const delta = readerProfile.estimatedVocab - book.recommendedRange[0];
  if (delta >= 2600) return "relaxed";
  if (delta >= 1400) return "warmup";
  if (delta >= 400) return "recommended";
  if (delta >= -500) return "stretch";
  if (delta >= -1300) return "demanding";
  return "not_yet";
}

function getReadinessTierKey(unknownCount) {
  if (unknownCount <= 1) return "ready_now";
  if (unknownCount <= 4) return "good_to_go";
  if (unknownCount <= 8) return "can_try";
  if (unknownCount <= 12) return "stretch";
  if (unknownCount <= 18) return "challenging";
  return "not_recommended";
}

function canReadImmediately(result) {
  return Boolean(result) && ["ready_now", "good_to_go", "can_try"].includes(result.tierKey);
}

function shouldOfferPlan(result) {
  return Boolean(result) && ["stretch", "challenging", "not_recommended"].includes(result.tierKey);
}

function shouldShowDirectChallenge(result) {
  return Boolean(result) && shouldOfferPlan(result);
}

function searchBooks(query) {
  const normalizedQuery = normalizeText(query);
  return buildBooks()
    .map((book) => ({ book, score: scoreBook(book, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.book);
}

function scoreBook(book, normalizedQuery) {
  if (!normalizedQuery) return 0;

  const title = normalizeText(book.title);
  const author = normalizeText(book.author);
  const tags = normalizeText(getSearchCorpus(book));
  let score = 0;

  if (title === normalizedQuery) score += 100;
  if (title.startsWith(normalizedQuery)) score += 65;
  if (title.includes(normalizedQuery)) score += 40;
  if (author.includes(normalizedQuery)) score += 20;
  if (tags.includes(normalizedQuery)) score += 16;

  normalizedQuery.split(" ").filter(Boolean).forEach((token) => {
    if (title.includes(token)) score += 12;
    if (author.includes(token)) score += 6;
    if (tags.includes(token)) score += 6;
  });

  return score;
}

function getSearchCorpus(book) {
  const tagAliasMap = {
    经典: "classic literary",
    社会: "society social",
    成长: "coming of age growth",
    奇幻: "fantasy magic",
    冒险: "adventure quest",
    校园: "school campus",
    爱情: "romance love",
    社交: "manners relationship",
    童话: "children fairy tale",
    治愈: "healing gentle",
    科幻: "science fiction sci-fi",
    反乌托邦: "dystopia dystopian",
    神话: "myth mythology",
    自然: "nature sea",
    短篇: "short novella",
    演示: "demo sample",
    自定义: "custom generated"
  };

  const aliases = book.tags.map((tag) => tagAliasMap[tag] || "").join(" ");
  return [book.title, book.author, book.blurb, book.tags.join(" "), aliases].join(" ");
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, " ").replace(/\s+/g, " ").trim();
}

function answerWord(isKnown) {
  const state = getState();
  const currentWord = state.orderedWords[state.currentIndex];
  if (!currentWord) return;

  if (!state.visitedWords.includes(currentWord.word)) {
    state.visitedWords.push(currentWord.word);
    if (isKnown) state.knownWords.push(currentWord);
    if (!isKnown) state.unknownWords.push(currentWord);
  }

  const reachedThreshold = state.unknownWords.length >= UNKNOWN_THRESHOLD;
  const exhaustedWords = state.visitedWords.length >= state.orderedWords.length;
  if (reachedThreshold || exhaustedWords) {
    state.result = buildResult(state.unknownWords.length);
    state.readerProfile = deriveReaderProfile(state);
    state.currentIndex = null;
    setState(state);
    go("result");
    return;
  }

  state.currentIndex = findNextIndex(state, isKnown ? 1 : -1);
  setState(state);
  renderTest();
}

function renderTest() {
  const state = getState();
  const currentWord = state.orderedWords[state.currentIndex];
  const askedCount = state.visitedWords.length;
  const progress = Math.round((askedCount / state.orderedWords.length) * 100);
  const testCopy = getCopy().test;

  document.getElementById("progressFill").style.width = `${progress}%`;
  document.getElementById("askedCount").textContent = String(askedCount);
  document.getElementById("knownCount").textContent = String(state.knownWords.length);
  document.getElementById("unknownCount").textContent = String(state.unknownWords.length);
  document.getElementById("currentWord").textContent = currentWord.word;
  document.getElementById("difficultyBadge").textContent = translate(testCopy.difficulty, { difficulty: currentWord.difficulty });
  document.getElementById("wordHint").textContent = translate(testCopy.wordHint, {
    chapter: currentWord.chapter,
    askedCount,
    total: state.orderedWords.length
  });
  document.getElementById("adaptiveNote").textContent = testCopy.adaptiveNote;
}

function findNextIndex(state, step) {
  let probe = state.currentIndex + step;
  while (probe >= 0 && probe < state.orderedWords.length) {
    if (!state.visitedWords.includes(state.orderedWords[probe].word)) return probe;
    probe += step;
  }

  for (let offset = 1; offset < state.orderedWords.length; offset += 1) {
    const left = state.currentIndex - offset;
    const right = state.currentIndex + offset;
    if (left >= 0 && !state.visitedWords.includes(state.orderedWords[left].word)) return left;
    if (right < state.orderedWords.length && !state.visitedWords.includes(state.orderedWords[right].word)) return right;
  }

  return 0;
}

function buildResult(unknownCount) {
  const level = unknownCount <= 5 ? "L1" : unknownCount <= 20 ? "L2" : "L3";
  const tierKey = getReadinessTierKey(unknownCount);
  const tierMeta = getReadinessMeta(tierKey);

  return {
    unknownCount,
    level,
    tierKey,
    tierCode: tierMeta.code,
    verdict: tierMeta.label
  };
}

function deriveReaderProfile(state) {
  if (!state.selectedBook || !state.result) return state.readerProfile || null;
  const required = state.selectedBook.recommendedRange[0];
  const unknownCount = state.result.unknownCount;
  let estimated = required;

  if (state.result.level === "L1") {
    estimated = required + 1200 - unknownCount * 60;
  } else if (state.result.level === "L2") {
    estimated = required + 200 - Math.max(unknownCount - 8, 0) * 70;
  } else {
    estimated = required - 900 - Math.max(unknownCount - 21, 0) * 90;
  }

  estimated = clamp(Math.round(estimated / 100) * 100, 1200, 12000);
  return {
    estimatedVocab: estimated,
    sourceBook: state.selectedBook.title,
    sourceLevel: state.result.level,
    unknownCount
  };
}

function ensureReaderProfile(state) {
  if (state.readerProfile || !state.selectedBook || !state.result) return state;
  const nextState = { ...state, readerProfile: deriveReaderProfile(state) };
  setState(nextState);
  return nextState;
}

function renderResult(state = getState()) {
  const { unknownCount } = state.result;
  const resultCopy = getCopy().result;
  const resultActionCopy = getResultActionCopy();
  const readiness = getReadinessMeta(state.result.tierKey);
  document.getElementById("resultUnknownTotal").textContent = String(unknownCount);
  document.getElementById("resultLevel").textContent = state.result.tierCode || readiness.code;
  document.getElementById("resultVerdict").textContent = readiness.label;

  document.getElementById("levelDescription").textContent = readiness.description;
  document.getElementById("resultPhilosophy").textContent = readiness.philosophy;

  const sortedUnknown = [...state.unknownWords].sort((a, b) => b.frequency - a.frequency || a.chapter - b.chapter);
  const list = document.getElementById("unknownWordList");
  list.innerHTML = sortedUnknown.length
    ? sortedUnknown.map((item) => `
        <div class="word-item">
          <strong>${item.word}</strong>
          <p class="word-meta">${escapeHtml(translate(resultCopy.chapterMeta, {
            frequency: item.frequency,
            difficulty: item.difficulty,
            chapter: item.chapter
          }))}</p>
          <p class="word-meta">${escapeHtml(getVocabularySentence(item))}</p>
        </div>
      `).join("")
    : `
      <div class="word-item">
        <strong>${escapeHtml(resultCopy.noneTitle)}</strong>
        <p class="word-meta">${escapeHtml(resultCopy.noneCopy)}</p>
      </div>
    `;

  const planButton = document.getElementById("planButton");
  const directReadButton = document.getElementById("directReadButton");
  if (shouldOfferPlan(state.result)) {
    planButton.disabled = false;
    planButton.textContent = resultActionCopy.generatePlan;
  } else {
    planButton.disabled = true;
    planButton.textContent = resultActionCopy.noPlan;
  }

  directReadButton.classList.remove("hidden");
  if (canReadImmediately(state.result)) {
    directReadButton.textContent = state.result.tierKey === "can_try"
      ? resultActionCopy.tryRead
      : resultActionCopy.recommendedRead;
  } else {
    directReadButton.textContent = resultActionCopy.directChallenge;
  }
}

function generatePlanFromResult() {
  const state = getState();
  if (!state.result || !shouldOfferPlan(state.result)) return;
  state.planDays = state.planDays || 7;
  state.plan = [];
  state.completion = [];
  state.studySession = null;
  state.directChallenge = false;
  state.gateUnlocked = false;
  setState(state);
  go("plan");
}

function getPlanWords(state) {
  if (state.result.level === "L2") {
    return [...state.unknownWords].sort((a, b) => a.chapter - b.chapter || b.frequency - a.frequency);
  }

  return [...state.unknownWords]
    .sort((a, b) => b.frequency - a.frequency || a.chapter - b.chapter);
}

function getPlanDayLimit(state) {
  return Math.max(getPlanWords(state).length, 1);
}

function ensurePlanForDays(days) {
  const state = getState();
  if (!state.result || !shouldOfferPlan(state.result)) return state;

  const planWords = getPlanWords(state);
  const safeDays = clamp(Number(days) || state.planDays || 7, 1, Math.max(planWords.length, 1));
  const plannedWordSet = new Set(planWords.map((word) => word.word));

  state.planDays = safeDays;
  state.plan = distributePlan(planWords, safeDays);
  state.completion = state.completion.filter((word) => plannedWordSet.has(word));
  state.studySession = null;
  state.wordRecords = {};
  state.planProgress = {};
  state.trainingDay = 0;
  state.directChallenge = false;
  state.gateUnlocked = state.plan.length > 0 && state.completion.length === planWords.length;
  setState(state);
  return state;
}

function bindPlanConfigurator() {
  const slider = document.getElementById("daysSlider");
  const dayInput = document.getElementById("planSliderValue");
  if (!slider || !dayInput || slider.dataset.bound === "true") return;
  slider.dataset.bound = "true";

  const sanitizeTypedDays = (rawValue, { allowEmpty = false } = {}) => {
    const sliderMax = Number(slider.max) || 1;
    const trimmed = String(rawValue ?? "").trim();
    if (!trimmed) {
      return allowEmpty ? null : clamp(Number(getState().planDays || slider.value || 1), 1, sliderMax);
    }

    const parsedValue = Number(trimmed);
    if (Number.isFinite(parsedValue)) {
      return clamp(Math.round(parsedValue), 1, sliderMax);
    }

    const fallbackNumeric = Number.parseFloat(trimmed);
    if (Number.isFinite(fallbackNumeric)) {
      return clamp(Math.round(fallbackNumeric), 1, sliderMax);
    }

    if (trimmed.startsWith("-")) return 1;
    return sliderMax;
  };

  const commitPlanDays = () => {
    const snappedDays = clamp(Math.round(Number(slider.value) || 1), 1, Number(slider.max) || 1);
    setPlanSliderPosition(slider, snappedDays);
    dayInput.dataset.editing = "false";
    updatePlanSliderValue(snappedDays, { force: true });
    ensurePlanForDays(snappedDays);
    renderPlan();
  };

  const restoreCommittedDays = () => {
    const committedDays = clamp(Number(getState().planDays || slider.value || 1), 1, Number(slider.max) || 1);
    setPlanSliderPosition(slider, committedDays);
    dayInput.dataset.editing = "false";
    updatePlanSliderValue(committedDays, { force: true });
  };

  const finishSliderDrag = () => {
    if (!slider.classList.contains("is-dragging")) return;
    slider.classList.remove("is-dragging");
    const snapped = clamp(Math.round(Number(slider.value) || 1), 1, Number(slider.max) || 1);
    updatePlanSliderValue(snapped, { force: true });
    animateSliderToValue(slider, snapped, commitPlanDays);
  };

  slider.addEventListener("pointerdown", (event) => {
    cancelSliderAnimation(slider);
    dayInput.dataset.editing = "false";
    slider.classList.add("is-dragging");
    try {
      slider.setPointerCapture?.(event.pointerId);
    } catch {
      // Native range controls do not expose pointer capture in every browser.
    }
  });

  slider.addEventListener("input", () => {
    syncPlanSliderVisual(slider);
    updatePlanSliderValue(Math.round(Number(slider.value)), { force: true });
  });

  slider.addEventListener("change", finishSliderDrag);
  slider.addEventListener("pointerup", finishSliderDrag);
  slider.addEventListener("pointercancel", finishSliderDrag);
  slider.addEventListener("lostpointercapture", finishSliderDrag);
  slider.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
      const snapped = clamp(Math.round(Number(slider.value) || 1), 1, Number(slider.max) || 1);
      updatePlanSliderValue(snapped, { force: true });
      animateSliderToValue(slider, snapped, commitPlanDays);
    }
  });

  const commitTypedDays = () => {
    const nextDays = sanitizeTypedDays(dayInput.value);
    if (nextDays == null) {
      restoreCommittedDays();
      return;
    }

    dayInput.dataset.editing = "false";
    updatePlanSliderValue(nextDays, { force: true });
    animateSliderToValue(slider, nextDays, commitPlanDays);
  };

  const previewTypedDays = () => {
    dayInput.dataset.editing = "true";
    const nextDays = sanitizeTypedDays(dayInput.value, { allowEmpty: true });
    if (nextDays == null) return;

    updatePlanSliderValue(nextDays, { force: true });
    animateSliderToValue(slider, nextDays);
  };

  dayInput.addEventListener("focus", () => {
    dayInput.dataset.editing = "true";
    dayInput.select();
  });
  dayInput.addEventListener("input", previewTypedDays);

  dayInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTypedDays();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      restoreCommittedDays();
      dayInput.blur();
    }
  });
  dayInput.addEventListener("blur", () => {
    if (dayInput.dataset.editing === "true") {
      commitTypedDays();
      return;
    }

    restoreCommittedDays();
  });
  dayInput.addEventListener("change", commitTypedDays);
}

function handleDirectReadAction() {
  const state = getState();
  if (!state.result) return;

  state.directChallenge = shouldShowDirectChallenge(state.result);
  state.gateUnlocked = canReadImmediately(state.result) || state.gateUnlocked;
  setState(state);
  go("gate");
}

function distributePlan(words, days) {
  const buckets = Array.from({ length: days }, (_, index) => ({ day: index + 1, tasks: [] }));
  words.forEach((word, index) => {
    buckets[index % days].tasks.push(word);
  });
  return buckets.filter((bucket) => bucket.tasks.length > 0);
}

function estimateMinutesForWords(wordCount) {
  if (wordCount <= 0) return 0;
  return Math.max(3, Math.round(wordCount * 1.4));
}

function buildSliderScaleValues(maxDays) {
  const points = [1, 0.25, 0.5, 0.75, 1]
    .map((point, index) => index === 0 ? 1 : Math.max(1, Math.round(maxDays * point)));
  const unique = [];

  points.forEach((value) => {
    if (!unique.includes(value)) unique.push(value);
  });

  if (unique[unique.length - 1] !== maxDays) unique.push(maxDays);
  while (unique.length < 5) {
    unique.splice(unique.length - 1, 0, unique[unique.length - 2] || 1);
  }

  return unique.slice(0, 5);
}

function cancelSliderAnimation(slider) {
  if (!slider || !slider.dataset.animFrame) return;
  cancelAnimationFrame(Number(slider.dataset.animFrame));
  delete slider.dataset.animFrame;
}

function animateSliderToValue(slider, targetValue, onComplete) {
  if (!slider) return;
  cancelSliderAnimation(slider);

  const startValue = Number(slider.value) || 1;
  const endValue = Number(targetValue) || startValue;
  if (Math.abs(endValue - startValue) < 0.01) {
    setPlanSliderPosition(slider, endValue);
    onComplete?.();
    return;
  }

  const duration = Math.min(520, 160 + Math.abs(endValue - startValue) * 22);
  const startTime = performance.now();
  const syncDisplay = () => {
    const displayValue = clamp(Math.round(Number(slider.value) || endValue), 1, Number(slider.max) || 1);
    updatePlanSliderValue(displayValue);
  };

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    setPlanSliderPosition(slider, startValue + (endValue - startValue) * eased);
    syncDisplay();

    if (progress < 1) {
      slider.dataset.animFrame = String(requestAnimationFrame(tick));
      return;
    }

    setPlanSliderPosition(slider, endValue);
    syncDisplay();
    delete slider.dataset.animFrame;
    onComplete?.();
  };

  slider.dataset.animFrame = String(requestAnimationFrame(tick));
}

function setPlanSliderPosition(slider, value) {
  if (!slider) return;
  const min = Number(slider.min) || 1;
  const max = Number(slider.max) || min;
  const nextValue = clamp(Number(value) || min, min, max);
  // Keep the live control value intact; changing the HTML value attribute during a drag resets Chromium's thumb.
  slider.value = String(nextValue);
  syncPlanSliderVisual(slider);
}

function syncPlanSliderVisual(slider) {
  if (!slider) return;
  const min = Number(slider.min) || 1;
  const max = Number(slider.max) || min;
  const current = clamp(Number(slider.value) || min, min, max);
  const percent = max === min ? 100 : ((current - min) / (max - min)) * 100;
  slider.style.setProperty("--slider-progress", `${percent}%`);
}

function renderPlanSliderScale(maxDays) {
  const scale = document.getElementById("planSliderScale");
  if (!scale) return;

  scale.innerHTML = buildSliderScaleValues(maxDays)
    .map((value) => `<span>${value}</span>`)
    .join("");
}

function updatePlanSliderValue(days, options = {}) {
  const sliderValue = document.getElementById("planSliderValue");
  if (!sliderValue) return;
  if (!options.force && sliderValue.dataset.editing === "true" && document.activeElement === sliderValue) return;
  sliderValue.value = String(days);
}

function normalizeStudyState(state) {
  state.wordRecords = state.wordRecords || {};
  state.planProgress = state.planProgress || {};
  state.trainingDay = Number(state.trainingDay) || 0;
  if (state.studySession && state.studySession.version !== STUDY_ENGINE_VERSION) state.studySession = null;
  return state;
}

function isStudyInProgress(state) {
  return Boolean(state.studySession && state.studySession.version === STUDY_ENGINE_VERSION && !state.studySession.completed);
}

function getBucketCompletion(bucket, state) {
  const completed = bucket.tasks.filter((task) => state.wordRecords?.[task.word]?.t === 3).length;
  return {
    completed,
    total: bucket.tasks.length,
    done: completed >= bucket.tasks.length,
    introduced: Boolean(state.planProgress?.[bucket.day]?.introduced)
  };
}

function getActivePlanDay(state) {
  if (isStudyInProgress(state)) return state.studySession.day;
  const nextIntroduction = state.plan.find((bucket) => !state.planProgress?.[bucket.day]?.introduced);
  if (nextIntroduction) return nextIntroduction.day;
  const dueDays = Object.values(state.wordRecords || {})
    .filter((record) => record.t < 3 && Number.isFinite(record.dueDay))
    .map((record) => record.dueDay);
  return dueDays.length ? Math.max(state.trainingDay + 1, Math.min(...dueDays)) : null;
}

function startStudyDay(day, options = {}) {
  const state = normalizeStudyState(getState());
  if (isStudyInProgress(state)) {
    if (options.navigate !== false) go("study");
    return;
  }
  const activeDay = getActivePlanDay(state);
  if (!activeDay || Number(day) !== activeDay) return;
  state.trainingDay = Math.max(state.trainingDay, activeDay);
  state.studySession = createStudySession(state, activeDay);

  setState(state);

  if (options.navigate === false) {
    if (document.body.dataset.page === "study") renderStudy();
    return;
  }

  go("study");
}

function createStudySession(state, day) {
  const bucket = state.plan.find((item) => item.day === day);
  const freshWords = bucket && !state.planProgress?.[day]?.introduced ? bucket.tasks.map((task) => task.word) : [];
  if (freshWords.length) state.planProgress[day] = { introduced: true };
  const reviewWords = Object.entries(state.wordRecords || {})
    .filter(([, record]) => record.t < 3 && record.dueDay <= day)
    .map(([word]) => word);
  const session = {
    version: STUDY_ENGINE_VERSION,
    bookId: state.selectedBook.id,
    day,
    phase: freshWords.length ? "first" : "review",
    firstQueue: freshWords,
    secondQueue: [],
    reviewQueue: reviewWords,
    answered: 0,
    initialCount: freshWords.length + reviewWords.length,
    completed: false,
    currentQuestion: null
  };
  return ensureStudyQuestion(session, state);
}

function ensureStudyQuestion(session, state) {
  if (!session || session.completed || session.currentQuestion) return session;
  if (session.phase === "first" && session.firstQueue.length) {
    const word = session.firstQueue[0];
    session.currentQuestion = { type: "recognition", word, gloss: getWordGloss(word), item: findVocabularyItem(state, word) };
    return session;
  }
  if (session.phase === "first") session.phase = "second";
  if (session.phase === "second" && session.secondQueue.length) {
    session.currentQuestion = buildRecallQuestion("second", session.secondQueue[0], state, session);
    return session;
  }
  if (session.phase === "second") session.phase = "review";
  if (session.phase === "review" && session.reviewQueue.length) {
    session.currentQuestion = buildRecallQuestion("review", session.reviewQueue[0], state, session);
    return session;
  }
  session.completed = true;
  return session;
}

function buildRecallQuestion(stage, word, state, session) {
  const wordItem = findVocabularyItem(state, word);
  return {
    type: stage === "second" ? "second-choice" : "review-choice",
    word,
    gloss: getWordGloss(word),
    item: wordItem,
    options: buildChoiceOptions(getStudyPoolWords(state, session.day, word), word, (candidate) => getWordGloss(candidate))
  };
}

function buildChoiceOptions(poolWords, targetWord, labelGetter) {
  const usedLabels = new Set([labelGetter(targetWord)]);
  const optionWords = [targetWord];

  shuffleArray(poolWords.filter((word) => word !== targetWord)).forEach((word) => {
    if (optionWords.length >= 4) return;
    const label = labelGetter(word);
    if (usedLabels.has(label)) return;
    usedLabels.add(label);
    optionWords.push(word);
  });

  return shuffleArray(optionWords).map((word) => ({
    word,
    value: labelGetter(word),
    correct: word === targetWord
  }));
}

function getStudyPoolWords(state, day, currentWord) {
  const dayWords = state.plan.find((bucket) => bucket.day === day)?.tasks.map((task) => task.word) || [];
  const planWords = state.plan.flatMap((bucket) => bucket.tasks.map((task) => task.word));
  const bookWords = state.selectedBook?.vocabulary?.map((item) => item.word) || [];
  return [...new Set([currentWord, ...dayWords, ...planWords, ...bookWords])];
}

function findVocabularyItem(state, word) {
  // Prefer the current built-in book data so existing accounts receive updated context sentences.
  const currentBook = buildBooks().find((book) => book.id === state.selectedBook?.id) || state.selectedBook;
  return currentBook?.vocabulary?.find((item) => item.word === word) || null;
}

function getWordGloss(word) {
  return WORD_GLOSSARY[word] || word;
}

function getStudyProgressRatio(session) {
  if (!session.cards.length) return 0;
  const progress = session.cards.reduce((total, card) => {
    const required = getStudyRequiredPasses(card);
    return total + Math.min(card.correctPasses / Math.max(required, 1), 1);
  }, 0);

  return progress / session.cards.length;
}

function renderPlan() {
  const state = getState();
  const planCopy = getCopy().plan;
  const total = state.plan.flatMap((bucket) => bucket.tasks).length;
  const selectedDays = state.planDays || 7;
  const sliderMax = getPlanDayLimit(state);
  const dailyWords = total ? Math.ceil(total / Math.max(selectedDays, 1)) : 0;
  const dailyMinutes = estimateMinutesForWords(dailyWords);
  const totalMinutes = estimateMinutesForWords(total);
  const activeDay = getActivePlanDay(state);

  const slider = document.getElementById("daysSlider");
  const dayInput = document.getElementById("planSliderValue");
  if (slider) {
    cancelSliderAnimation(slider);
    slider.min = "1";
    slider.max = String(sliderMax);
    setPlanSliderPosition(slider, clamp(selectedDays, 1, sliderMax));
    requestAnimationFrame(() => setPlanSliderPosition(slider, clamp(getState().planDays || selectedDays, 1, sliderMax)));
  }
  if (dayInput) {
    dayInput.min = "1";
    dayInput.max = String(sliderMax);
  }
  renderPlanSliderScale(sliderMax);
  updatePlanSliderValue(selectedDays, { force: true });
  document.getElementById("planSliderHint").textContent = planCopy.sliderHint;
  document.getElementById("planSummary").textContent = total
    ? translate(planCopy.summary, {
      days: selectedDays,
      dailyWords,
      dailyMinutes,
      totalMinutes
    })
    : planCopy.summaryEmpty;

  document.getElementById("planWordCount").textContent = String(total);
  document.getElementById("planDayCount").textContent = String(selectedDays);
  document.getElementById("planDailyWordCount").textContent = String(dailyWords);
  document.getElementById("planDailyTime").textContent = translate(planCopy.minutes, { minutes: dailyMinutes });
  document.getElementById("planRuleCopy").textContent = planCopy.rule;

  const primaryStudyButton = document.getElementById("startTodayStudy");
  if (primaryStudyButton) {
    const isContinuing = !!state.studySession && !state.studySession.completed && state.studySession.day === activeDay;
    primaryStudyButton.textContent = isContinuing ? planCopy.continueToday : planCopy.startToday;
    primaryStudyButton.disabled = !activeDay;
  }

  const grid = document.getElementById("planGrid");
  grid.innerHTML = state.plan.map((bucket) => {
    const bucketStatus = getBucketCompletion(bucket, state);
    const masteredWords = new Set(Object.entries(state.wordRecords || {})
      .filter(([, record]) => record.t === 3)
      .map(([word]) => word));
    const isActive = activeDay === bucket.day;
    const isLocked = activeDay !== null && bucket.day > activeDay && !bucketStatus.done;
    const badgeCopy = bucketStatus.done
      ? planCopy.completedDay
      : isActive
        ? planCopy.activeDay
        : planCopy.lockedDay;

    return `
      <div class="day-card day-card-compact ${isActive ? "day-card-active" : ""} ${bucketStatus.done ? "day-card-complete" : ""}">
        <div class="day-head">
          <div class="stack" style="gap: 6px;">
            <strong>${escapeHtml(translate(planCopy.day, { day: bucket.day }))}</strong>
            <span class="task-meta">${escapeHtml(translate(planCopy.progress, { done: bucketStatus.completed, total: bucketStatus.total }))}</span>
          </div>
          <div class="day-head-meta">
            <span class="day-badge">${escapeHtml(translate(planCopy.count, { count: bucket.tasks.length }))}</span>
            <span class="day-badge ${bucketStatus.done ? "day-badge-strong" : ""}">${escapeHtml(badgeCopy)}</span>
          </div>
        </div>
        ${!isLocked ? `
          <details class="plan-day-details">
            <summary>${escapeHtml(planCopy.viewWords)}</summary>
            <div class="task-list">
              ${bucket.tasks.map((task) => `
                <div class="task ${masteredWords.has(task.word) ? "task-complete" : ""}">
                  <div class="task-top">
                    <strong>${task.word}</strong>
                    <span class="task-status-chip ${masteredWords.has(task.word) ? "task-status-chip-done" : ""}">
                      ${escapeHtml(masteredWords.has(task.word) ? planCopy.done : getWordGloss(task.word))}
                    </span>
                  </div>
                  <p class="task-meta">${escapeHtml(translate(planCopy.taskMeta, {
                    chapter: task.chapter,
                    frequency: task.frequency,
                    difficulty: task.difficulty
                  }))}</p>
                </div>
              `).join("")}
            </div>
          </details>
        ` : ""}
      </div>
    `;
  }).join("");
}

function renderStudy() {
  const state = getState();
  if (!state.studySession) {
    go("plan");
    return;
  }

  state.studySession = ensureStudyQuestion(state.studySession, state);
  setState(state);

  const session = state.studySession;
  const studyCopy = getCopy().study;
  const mastered = session.cards.filter((card) => card.mastered).length;
  const left = session.cards.filter((card) => !card.mastered).length;
  const progressPercent = Math.round(getStudyProgressRatio(session) * 100);

  document.getElementById("studyTitle").textContent = translate(studyCopy.currentDay, { day: session.day });
  document.getElementById("studyBookLabel").textContent = state.selectedBook.title;
  document.getElementById("studyBookStatLabel").textContent = studyCopy.targetBook;
  document.getElementById("studyProgressCopy").textContent = translate(studyCopy.progress, { mastered, total: session.cards.length });
  document.getElementById("studyProgressFill").style.width = `${progressPercent}%`;
  document.getElementById("studyRoundCount").textContent = String(session.answered);
  document.getElementById("studyMasteredCount").textContent = String(mastered);
  document.getElementById("studyLeftCount").textContent = String(left);
  document.getElementById("studyRoundLabel").textContent = studyCopy.roundsLabel;
  document.getElementById("studyMasteredLabel").textContent = studyCopy.masteredLabel;
  document.getElementById("studyLeftLabel").textContent = studyCopy.leftLabel;
  document.getElementById("studyRuleTitle").textContent = studyCopy.masteryRuleTitle;
  document.getElementById("studyRuleCopy").textContent = studyCopy.masteryRuleCopy;
  document.getElementById("studyHint").textContent = studyCopy.questionHint;
  document.getElementById("studyChecklistTitle").textContent = studyCopy.checklistTitle;
  document.getElementById("studyBackToPlan").textContent = studyCopy.backToPlan;
  document.getElementById("studyGotoGate").textContent = studyCopy.gotoGate;

  document.getElementById("studyBackToPlan").onclick = () => go("plan");
  document.getElementById("studyGotoGate").onclick = () => go("gate");

  const feedback = document.getElementById("studyFeedback");
  if (session.lastFeedback) {
    feedback.classList.remove("hidden");
    feedback.textContent = session.lastFeedback.message;
  } else {
    feedback.classList.add("hidden");
    feedback.textContent = "";
  }

  const surface = document.getElementById("studyQuestionSurface");
  const answerArea = document.getElementById("studyAnswerArea");
  const checklist = document.getElementById("studyChecklist");
  const badge = document.getElementById("studyTypeBadge");
  const prompt = document.getElementById("studyPrompt");
  const bucket = state.plan.find((item) => item.day === session.day);
  checklist.innerHTML = (bucket?.tasks || []).map((task) => `
    <div class="task ${state.completion.includes(task.word) ? "task-complete" : ""}">
      <div class="task-top">
        <strong>${escapeHtml(task.word)}</strong>
        <span class="task-status-chip ${state.completion.includes(task.word) ? "task-status-chip-done" : ""}">
          ${escapeHtml(state.completion.includes(task.word) ? getCopy().plan.done : getWordGloss(task.word))}
        </span>
      </div>
      <p class="task-meta">${escapeHtml(translate(getCopy().plan.taskMeta, {
        chapter: task.chapter,
        frequency: task.frequency,
        difficulty: task.difficulty
      }))}</p>
    </div>
  `).join("");

  if (session.completed || !session.currentQuestion) {
    badge.textContent = studyCopy.typeLabels.scene_to_en_choice;
    prompt.textContent = studyCopy.completeTitle;
    surface.innerHTML = `
      <div class="study-complete-card">
        <strong>${escapeHtml(studyCopy.completeTitle)}</strong>
        <p>${escapeHtml(studyCopy.completeCopy)}</p>
      </div>
    `;
    answerArea.innerHTML = "";
    return;
  }

  const question = session.currentQuestion;
  badge.textContent = question.badge;
  prompt.textContent = question.prompt;
  surface.innerHTML = renderStudyQuestionSurface(question);
  answerArea.innerHTML = renderStudyAnswerArea(question);

  answerArea.querySelectorAll("[data-study-choice]").forEach((button) => {
    button.addEventListener("click", () => submitStudyAnswer(decodeURIComponent(button.dataset.studyChoice || "")));
  });

  const submitButton = answerArea.querySelector("[data-study-submit]");
  const spellInput = document.getElementById("studySpellInput");
  if (submitButton && spellInput) {
    submitButton.addEventListener("click", () => submitStudyAnswer(spellInput.value));
    spellInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitStudyAnswer(spellInput.value);
      }
    });
    spellInput.focus();
  }
}

function renderStudyQuestionSurface(question) {
  if (question.visual) {
    return `
      <div class="study-visual-card" style="--study-hue: ${question.visual.hue};">
        <div class="study-visual-art">
          <span class="study-visual-ring"></span>
          <span class="study-visual-orb"></span>
          <span class="study-visual-wave"></span>
        </div>
        <strong>${escapeHtml(question.visual.title)}</strong>
        <p>${escapeHtml(question.visual.label)}</p>
        <span class="task-meta">${escapeHtml(question.subline || "")}</span>
      </div>
    `;
  }

  return `
    <div class="study-word-card">
      <div class="word">${escapeHtml(question.headline)}</div>
      <p class="word-meta">${escapeHtml(question.subline || "")}</p>
    </div>
  `;
}

function renderStudyAnswerArea(question) {
  if (question.type === "zh_to_en_spell") {
    return `
      <div class="study-spell-row">
        <input id="studySpellInput" type="text" placeholder="${escapeHtml(question.inputPlaceholder || "")}" autocomplete="off" spellcheck="false">
        <button class="primary-btn" type="button" data-study-submit>${escapeHtml(getCopy().study.submit)}</button>
      </div>
    `;
  }

  return `
    <div class="study-choice-grid">
      ${question.options.map((option) => `
        <button class="secondary-btn study-choice-btn" type="button" data-study-choice="${encodeURIComponent(option.value)}">
          ${escapeHtml(option.value)}
        </button>
      `).join("")}
    </div>
  `;
}

function submitStudyAnswer(rawAnswer) {
  const state = getState();
  const session = state.studySession;
  const question = session?.currentQuestion;
  if (!session || !question) return;

  const card = session.cards.find((item) => item.word === question.word);
  if (!card) return;

  const normalizedAnswer = normalizeStudyAnswer(rawAnswer);
  const normalizedExpected = normalizeStudyAnswer(question.answer);
  const correct = normalizedAnswer === normalizedExpected;

  session.turn += 1;
  session.answered += 1;
  card.attempts += 1;

  if (correct) {
    card.correctPasses += 1;
    card.dueTurn = session.turn + Math.min(5, 1 + (card.correctPasses * 2));
    if (card.correctPasses >= getStudyRequiredPasses(card)) {
      card.mastered = true;
      if (!state.completion.includes(card.word)) state.completion.push(card.word);
    }
  } else {
    card.wrongCount += 1;
    card.dueTurn = session.turn + 1;
  }

  session.lastFeedback = {
    correct,
    message: correct
      ? translate(question.type === "zh_to_en_spell" ? getCopy().study.spellSuccess : getCopy().study.correct, { word: question.word, gloss: question.gloss })
      : translate(question.type === "zh_to_en_spell" ? getCopy().study.spellMiss : getCopy().study.incorrect, { word: question.word, gloss: question.gloss })
  };
  session.currentQuestion = null;
  session.completed = session.cards.every((item) => item.mastered);

  const totalPlanWords = state.plan.flatMap((bucket) => bucket.tasks).length;
  state.gateUnlocked = totalPlanWords > 0 && state.completion.length === totalPlanWords;
  state.studySession = ensureStudyQuestion(session, state);
  setState(state);
  renderStudy();
}

function normalizeStudyAnswer(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// 2.4 uses a book-first, spaced-review flow. The plan never contains live answer data.
function trainingCopy() {
  return currentLanguage === "zh" ? {
    day: (day) => `第 ${day} 天训练`, first: "第一轮：快速判断", firstPrompt: "你认识这个词吗？先凭直觉判断。",
    knows: "认识", doesNotKnow: "不认识", example: "书内语境例句", translation: "中文翻译", confirm: "确认释义",
    confirmPrompt: "确认释义后，它会在下一训练日进入第一次复习。", continue: "继续", second: "第二轮：辨认学习",
    secondPrompt: "选择最贴切的中文释义。答案会立即反馈。", review: "间隔复习", reviewPrompt: "选择最贴切的中文释义。连续答对会延长下一次复习间隔。",
    correct: "回答正确。", incorrect: "回答错误，记忆计数已重置为 t = 0。", scheduled: "已安排到下一训练日复习。",
    complete: "本次训练已完成", completeCopy: "训练结果已保存。下一次训练会按 1 天、2 天、4 天的间隔安排复习。",
    back: "返回找书", status: "本次状态", progress: (done, total) => `已完成 ${done} / ${total} 个训练步骤`, reviewed: "已答题", mastered: "本轮掌握", remaining: "待处理",
    planBlocked: "训练进行中，计划内容已暂时隐藏", planBlockedCopy: "为了避免提前看到单词释义或答案，请先完成当前训练。你的进度已自动保存。", resume: "继续当前训练"
  } : {
    day: (day) => `Training day ${day}`, first: "First pass: quick recognition", firstPrompt: "Do you recognize this word? Trust your first impression.",
    knows: "I know it", doesNotKnow: "I don't know it", example: "Book-context sentence", translation: "Chinese translation", confirm: "Confirm the meaning",
    confirmPrompt: "After confirmation, it will return on the next training day for its first review.", continue: "Continue", second: "Second pass: meaning check",
    secondPrompt: "Choose the closest Chinese meaning. You will see the result immediately.", review: "Spaced review", reviewPrompt: "Choose the closest Chinese meaning. Each correct answer extends the next interval.",
    correct: "Correct.", incorrect: "Not quite. The memory count has reset to t = 0.", scheduled: "Scheduled for the next training day.",
    complete: "This training session is complete", completeCopy: "Your result is saved. Reviews will return on the 1-day, 2-day, and 4-day rhythm.",
    back: "Back to books", status: "Session status", progress: (done, total) => `${done} / ${total} training steps complete`, reviewed: "Answered", mastered: "Mastered", remaining: "Remaining",
    planBlocked: "Your active training keeps the plan private", planBlockedCopy: "Finish the current training before reopening the plan, so no word meaning or answer is revealed ahead of time. Your progress is already saved.", resume: "Resume training"
  };
}

function renderPlanBlocked() {
  const shell = document.querySelector(".plan-shell");
  if (!shell) return;
  const copy = trainingCopy();
  shell.innerHTML = `
    <span class="eyebrow">InRead 2.4</span>
    <h2>${escapeHtml(copy.planBlocked)}</h2>
    <p class="lead compact">${escapeHtml(copy.planBlockedCopy)}</p>
    <div class="plan-blocked-card">
      <span class="plan-blocked-lock" aria-hidden="true">&#128274;</span>
      <strong>${escapeHtml(currentLanguage === "zh" ? "计划将在训练结束后恢复显示" : "The plan reopens after this session")}</strong>
      <p>${escapeHtml(currentLanguage === "zh" ? "这能让每次判断都基于真实记忆，而不是提前获得答案。" : "This keeps each decision based on recall rather than a previewed answer.")}</p>
      <button id="resumeStudy" class="primary-btn" type="button">${escapeHtml(copy.resume)}</button>
    </div>`;
  document.getElementById("resumeStudy")?.addEventListener("click", () => go("study"));
}

function renderStudy() {
  const state = normalizeStudyState(getState());
  const session = state.studySession;
  if (!session || session.version !== STUDY_ENGINE_VERSION) {
    go("plan");
    return;
  }
  ensureStudyQuestion(session, state);
  setState(state);

  const copy = trainingCopy();
  const records = Object.values(state.wordRecords || {});
  const mastered = records.filter((record) => record.t === 3).length;
  const remaining = (session.firstQueue.length + session.secondQueue.length + session.reviewQueue.length) + (session.currentQuestion ? 1 : 0);
  const done = session.answered;
  const total = Math.max(session.initialCount, done + remaining, 1);
  document.getElementById("studyTitle").textContent = copy.day(session.day);
  document.getElementById("studyBookLabel").textContent = state.selectedBook.title;
  document.getElementById("studyProgressCopy").textContent = copy.progress(done, total);
  document.getElementById("studyProgressFill").style.width = `${Math.min(100, Math.round((done / total) * 100))}%`;
  document.getElementById("studyRoundCount").textContent = String(done);
  document.getElementById("studyMasteredCount").textContent = String(mastered);
  document.getElementById("studyLeftCount").textContent = String(Math.max(remaining - 1, 0));
  document.getElementById("studyRoundLabel").textContent = copy.reviewed;
  document.getElementById("studyMasteredLabel").textContent = copy.mastered;
  document.getElementById("studyLeftLabel").textContent = copy.remaining;
  document.getElementById("studyStatusEyebrow").textContent = copy.status;
  document.getElementById("studyExit").textContent = copy.back;
  document.getElementById("studyExit").onclick = () => go("search");

  const question = session.currentQuestion;
  const badge = document.getElementById("studyTypeBadge");
  const prompt = document.getElementById("studyPrompt");
  const surface = document.getElementById("studyQuestionSurface");
  const answers = document.getElementById("studyAnswerArea");
  if (!question || session.completed) {
    badge.textContent = "InRead 2.4";
    prompt.textContent = copy.complete;
    surface.innerHTML = `<div class="study-complete-card"><strong>${escapeHtml(copy.complete)}</strong><p>${escapeHtml(copy.completeCopy)}</p></div>`;
    answers.innerHTML = `<button class="primary-btn" type="button" data-study-finish>${escapeHtml(copy.back)}</button>`;
    answers.querySelector("[data-study-finish]").addEventListener("click", () => go("search"));
    return;
  }
  if (question.type === "recognition") {
    badge.textContent = copy.first;
    prompt.textContent = copy.firstPrompt;
    surface.innerHTML = renderRecognitionSurface(question, copy);
    answers.innerHTML = `<div class="study-recognition-actions"><button class="primary-btn" type="button" data-recognizes="true">${escapeHtml(copy.knows)}</button><button class="ghost-btn" type="button" data-recognizes="false">${escapeHtml(copy.doesNotKnow)}</button></div>`;
    answers.querySelectorAll("[data-recognizes]").forEach((button) => button.addEventListener("click", () => chooseRecognition(button.dataset.recognizes === "true")));
    return;
  }
  if (question.type === "recognition-confirm") {
    badge.textContent = copy.confirm;
    prompt.textContent = copy.confirmPrompt;
    surface.innerHTML = `<div class="study-word-card"><div class="word">${escapeHtml(question.word)}</div><p class="study-definition">${escapeHtml(question.gloss)}</p></div>`;
    answers.innerHTML = `<button class="primary-btn" type="button" data-study-next>${escapeHtml(copy.continue)}</button>`;
    answers.querySelector("[data-study-next]").addEventListener("click", finishRecognitionConfirm);
    return;
  }
  const isSecond = question.type === "second-choice";
  badge.textContent = isSecond ? copy.second : copy.review;
  prompt.textContent = isSecond ? copy.secondPrompt : copy.reviewPrompt;
  surface.innerHTML = `<div class="study-word-card"><div class="word">${escapeHtml(question.word)}</div><p class="word-meta">${escapeHtml(question.item ? `Chapter ${question.item.chapter}` : "")}</p></div>`;
  answers.innerHTML = renderRecallAnswers(question, copy);
  if (question.feedback) {
    answers.querySelector("[data-study-next]").addEventListener("click", advanceRecall);
  } else {
    answers.querySelectorAll("[data-study-choice]").forEach((button) => button.addEventListener("click", () => submitRecall(decodeURIComponent(button.dataset.studyChoice || ""))));
  }
}

function renderRecognitionSurface(question, copy) {
  const item = question.item || {};
  return `<div class="study-word-card study-context-card"><div class="word">${escapeHtml(question.word)}</div><div class="study-context"><strong>${escapeHtml(copy.example)}</strong><p>${escapeHtml(item.sentenceEn || `In ${getState().selectedBook.title}, ${question.word} appears in a key reading moment.`)}</p><strong>${escapeHtml(copy.translation)}</strong><p>${escapeHtml(item.sentenceZh || `在《${getState().selectedBook.title}》的阅读语境中，这个词出现在理解情节的关键处。`)}</p></div></div>`;
}

function renderRecallAnswers(question, copy) {
  const feedback = question.feedback;
  return `<div class="study-choice-grid">${question.options.map((option) => {
    const selected = feedback?.selected === option.value;
    const stateClass = feedback ? (option.correct ? "is-correct" : selected ? "is-wrong" : "is-muted") : "";
    const marker = feedback ? (option.correct ? " &#10003;" : selected ? " &#10005;" : "") : "";
    return `<button class="secondary-btn study-choice-btn ${stateClass}" type="button" ${feedback ? "disabled" : ""} data-study-choice="${encodeURIComponent(option.value)}">${escapeHtml(option.value)}${marker}</button>`;
  }).join("")}</div>${feedback ? `<div class="study-feedback ${feedback.correct ? "is-correct" : "is-wrong"}">${escapeHtml(feedback.correct ? copy.correct : copy.incorrect)}<span>${escapeHtml(feedback.note)}</span></div><button class="primary-btn" type="button" data-study-next>${escapeHtml(copy.continue)}</button>` : ""}`;
}

function chooseRecognition(known) {
  const state = normalizeStudyState(getState());
  const session = state.studySession;
  const question = session?.currentQuestion;
  if (!session || !question || question.type !== "recognition") return;
  if (known) {
    question.type = "recognition-confirm";
  } else {
    session.firstQueue.shift();
    session.secondQueue.push(question.word);
    session.currentQuestion = null;
  }
  setState(state);
  renderStudy();
}

function finishRecognitionConfirm() {
  const state = normalizeStudyState(getState());
  const session = state.studySession;
  const question = session?.currentQuestion;
  if (!session || !question || question.type !== "recognition-confirm") return;
  scheduleFirstReview(state, question.word, session.day);
  session.firstQueue.shift();
  session.answered += 1;
  session.currentQuestion = null;
  setState(state);
  renderStudy();
}

function submitRecall(answer) {
  const state = normalizeStudyState(getState());
  const session = state.studySession;
  const question = session?.currentQuestion;
  if (!session || !question || question.feedback) return;
  const correct = normalizeStudyAnswer(answer) === normalizeStudyAnswer(question.gloss);
  if (question.type === "second-choice") scheduleFirstReview(state, question.word, session.day);
  else updateReviewRecord(state, question.word, session.day, correct);
  question.feedback = { correct, selected: answer, note: question.type === "second-choice" ? trainingCopy().scheduled : getReviewNote(state.wordRecords[question.word]) };
  setState(state);
  renderStudy();
}

function advanceRecall() {
  const state = normalizeStudyState(getState());
  const session = state.studySession;
  const question = session?.currentQuestion;
  if (!session || !question?.feedback) return;
  if (question.type === "second-choice") session.secondQueue.shift();
  else session.reviewQueue.shift();
  session.answered += 1;
  session.currentQuestion = null;
  ensureStudyQuestion(session, state);
  setState(state);
  renderStudy();
}

function scheduleFirstReview(state, word, day) {
  state.wordRecords[word] = { t: 0, dueDay: day + 1, introducedDay: day };
}

function updateReviewRecord(state, word, day, correct) {
  const record = state.wordRecords[word] || { t: 0, dueDay: day, introducedDay: day };
  if (!correct) {
    record.t = 0;
    record.dueDay = day + 1;
  } else {
    record.t += 1;
    record.dueDay = record.t === 1 ? day + 1 : record.t === 2 ? day + 2 : day + 4;
    if (record.t >= 3) {
      record.t = 3;
      if (!state.completion.includes(word)) state.completion.push(word);
    }
  }
  state.wordRecords[word] = record;
  const totalPlanWords = state.plan.flatMap((bucket) => bucket.tasks).length;
  state.gateUnlocked = totalPlanWords > 0 && state.completion.length === totalPlanWords;
}

function getReviewNote(record) {
  if (!record) return "";
  if (record.t === 3) return currentLanguage === "zh" ? "该词已完成本轮 3 次连续正确复习。" : "This word has completed 3 consecutive successful reviews.";
  return currentLanguage === "zh" ? `当前 t = ${record.t}，下一次将在第 ${record.dueDay} 天出现。` : `Current t = ${record.t}; it returns on training day ${record.dueDay}.`;
}

function renderGate() {
  const state = getState();
  const gateCopy = getCopy().gate;
  document.getElementById("gateBookLabel").textContent = state.selectedBook.title;

  const gateStateLabel = document.getElementById("gateStateLabel");
  const gateMessage = document.getElementById("gateMessage");
  const gateReasonLabel = document.getElementById("gateReasonLabel");
  const gateActionLabel = document.getElementById("gateActionLabel");
  gateStateLabel.classList.remove("success", "tone-positive", "tone-balanced", "tone-caution", "tone-warning", "tone-danger", "tone-neutral");
  renderGateGuide(state.result?.tierKey || null);

  if (!state.result) {
    gateStateLabel.textContent = gateCopy.locked;
    gateStateLabel.classList.add("tone-neutral");
    gateMessage.textContent = gateCopy.noResultMessage;
    gateReasonLabel.textContent = gateCopy.waitingTest;
    gateActionLabel.textContent = gateCopy.startTest;
    return;
  }

  const readiness = getReadinessMeta(state.result.tierKey);
  gateStateLabel.classList.add(`tone-${readiness.tone}`);

  if (state.directChallenge) {
    gateStateLabel.textContent = currentLanguage === "zh" ? "直接挑战中" : "Direct challenge";
    gateMessage.textContent = readiness.readyMessage({ title: state.selectedBook.title });
    gateReasonLabel.textContent = readiness.label;
    gateActionLabel.textContent = gateCopy.readNow;
    return;
  }

  if (canReadImmediately(state.result) || state.gateUnlocked) {
    gateStateLabel.textContent = canReadImmediately(state.result) ? readiness.readyLabel : readiness.readyLabel;
    gateMessage.textContent = state.gateUnlocked && !canReadImmediately(state.result)
      ? readiness.preparedMessage({ title: state.selectedBook.title })
      : readiness.readyMessage({ title: state.selectedBook.title });
    gateReasonLabel.textContent = readiness.label;
    gateActionLabel.textContent = gateCopy.readNow;
    return;
  }

  gateStateLabel.textContent = readiness.pendingLabel;
  gateMessage.textContent = readiness.pendingMessage({ title: state.selectedBook.title });
  gateReasonLabel.textContent = readiness.label;
  gateActionLabel.textContent = shouldOfferPlan(state.result) ? gateCopy.goPlan : gateCopy.goResult;
}

function renderGateGuide(activeTierKey) {
  const container = document.getElementById("gateGuideList");
  if (!container) return;

  const guideOrder = ["ready_now", "good_to_go", "can_try", "stretch", "challenging", "not_recommended"];
  container.innerHTML = guideOrder.map((key) => {
    const meta = getReadinessMeta(key);
    return `
      <div class="mini-card ${key === activeTierKey ? "guide-card-active" : ""}">
        <span class="guide-code">${meta.code}</span>
        <strong>${escapeHtml(meta.label)}</strong>
        <span>${escapeHtml(meta.guide)}</span>
      </div>
    `;
  }).join("");
}

function findBook(query) {
  const normalized = normalizeText(query);
  return buildBooks().find((book) => normalizeText(book.title) === normalized);
}

function collectAllTags() {
  return [...new Set(buildBooks().flatMap((book) => book.tags))];
}

function formatVocabRange([min, max]) {
  return `${min}-${max} ${getCopy().units.words}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shuffleArray(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function hashWord(word) {
  return [...String(word)].reduce((seed, char) => seed + char.charCodeAt(0), 0) % 360;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createVocabularyList(entries, title) {
  const classicSentence = getClassicBookSentence(title);
  return entries.map(([word, difficulty, frequency, chapter], index) => ({
    word,
    difficulty,
    frequency,
    chapter,
    sentenceEn: classicSentence.en,
    sentenceZh: classicSentence.zh,
    order: index + 1
  }));
}

function getClassicBookSentence(title) {
  const sentences = {
    "The Great Gatsby": { en: "So we beat on, boats against the current, borne back ceaselessly into the past.", zh: "于是我们奋力前行，逆水行舟，却不断被往昔推回。" },
    "Harry Potter and the Sorcerer's Stone": { en: "It does not do to dwell on dreams and forget to live.", zh: "沉湎于梦想而忘记生活，是没有意义的。" },
    "Pride and Prejudice": { en: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", zh: "有钱的单身汉总要娶妻，这是一条举世公认的真理。" },
    "Charlotte's Web": { en: "After all, what’s a life, anyway? We’re born, we live a little while, we die.", zh: "说到底，生命是什么呢？我们出生，活一小段时间，然后离开。" },
    "The Hobbit": { en: "In a hole in the ground there lived a hobbit.", zh: "地洞里住着一个霍比特人。" },
    "The Giver": { en: "When people have the freedom to choose, they choose wrong.", zh: "当人们拥有选择的自由时，他们往往会做出错误的选择。" },
    "Percy Jackson and the Lightning Thief": { en: "Look, I didn’t want to be a half-blood.", zh: "听着，我并不想成为一个混血者。" },
    "The Old Man and the Sea": { en: "But man is not made for defeat. A man can be destroyed but not defeated.", zh: "人不是为失败而生的。一个人可以被毁灭，但不能被打败。" }
  };
  return sentences[title] || {
    en: `A key line in ${title} gives this word a living reading context.`,
    zh: `《${title}》中的关键语句为这个词提供了真实的阅读语境。`
  };
}

function getVocabularySentence(item) {
  if (currentLanguage === "zh") return item.sentenceZh || item.sentence || "";
  return item.sentenceEn || item.sentence || item.sentenceZh || "";
}

function buildFallbackBook(title) {
  const vocabulary = createVocabularyList(
    [
      ["reluctant", 2, 14, 1], ["glimmer", 2, 12, 1], ["threshold", 2, 11, 1], ["obscure", 3, 10, 1],
      ["restless", 2, 13, 2], ["hesitate", 2, 11, 2], ["frail", 3, 9, 2], ["subtle", 3, 10, 2],
      ["linger", 2, 14, 3], ["grim", 3, 8, 3], ["solemn", 3, 8, 3], ["scarce", 3, 7, 4],
      ["torrent", 4, 6, 4], ["vivid", 3, 8, 4], ["rigid", 4, 7, 5], ["falter", 4, 7, 5],
      ["abrupt", 4, 6, 6], ["dread", 4, 7, 6], ["delicate", 3, 8, 6], ["unsettling", 4, 5, 7],
      ["resilient", 4, 6, 7], ["intangible", 5, 4, 8], ["intricate", 5, 4, 8], ["inevitable", 5, 4, 9]
    ],
    title
  );

  return {
    id: normalizeText(title).replaceAll(" ", "-"),
    title,
    author: "Demo import",
    blurb: "未命中内置书名，因此系统自动生成了一个可继续体验流程的演示词库。",
    source: "自动生成演示数据",
    totalWords: vocabulary.length,
    coverage: "自定义演示",
    recommendedRange: [3800, 4800],
    tags: ["演示", "自定义"],
    vocabulary
  };
}

function makeBook(config, entries) {
  return {
    ...config,
    totalWords: 24,
    vocabulary: createVocabularyList(entries, config.title)
  };
}

function buildBooks() {
  return [
    makeBook(
      {
        id: "great-gatsby",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        blurb: "奢华与幻灭并行，适合展示书内高频但非基础词如何影响阅读流畅度。",
        source: "内置演示词库",
        coverage: "前 8 章高频词",
        recommendedRange: [4200, 5600],
        tags: ["经典", "社会", "成长"]
      },
      [
        ["languid", 2, 14, 1], ["solemnity", 3, 10, 1], ["heedlessly", 4, 8, 1], ["opulent", 3, 13, 1],
        ["riotous", 4, 8, 2], ["furtive", 4, 9, 2], ["gaudy", 3, 11, 2], ["melancholy", 3, 12, 3],
        ["vigilance", 4, 7, 3], ["lavish", 2, 14, 3], ["insinuate", 4, 8, 4], ["tumult", 3, 10, 4],
        ["grotesque", 4, 7, 4], ["nebulous", 5, 5, 5], ["hauteur", 5, 5, 5], ["supercilious", 5, 4, 5],
        ["elation", 3, 10, 6], ["inexhaustible", 5, 4, 6], ["feigned", 4, 7, 6], ["disconcerting", 4, 6, 7],
        ["bewildered", 3, 11, 7], ["transcend", 5, 4, 7], ["cynical", 3, 12, 8], ["obscure", 3, 10, 8]
      ]
    ),
    makeBook(
      {
        id: "harry-potter-1",
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        blurb: "奇幻场景密集，适合演示先准备少量关键词，再回到故事现场的体验。",
        source: "内置演示词库",
        coverage: "前 10 章高频词",
        recommendedRange: [3200, 4300],
        tags: ["奇幻", "冒险", "校园"]
      },
      [
        ["peculiar", 2, 15, 1], ["muttered", 2, 14, 1], ["dazzling", 3, 11, 1], ["forbidden", 3, 13, 2],
        ["lurking", 3, 12, 2], ["towering", 2, 13, 2], ["whispering", 2, 14, 3], ["gleaming", 3, 11, 3],
        ["snarled", 4, 8, 3], ["enchanted", 3, 12, 4], ["bewilderment", 4, 8, 4], ["grimace", 4, 7, 4],
        ["soaring", 3, 10, 5], ["shuddered", 4, 8, 5], ["ominous", 4, 7, 5], ["transfixed", 4, 7, 6],
        ["splendid", 2, 13, 6], ["bewitched", 4, 8, 6], ["briskly", 3, 10, 7], ["mischief", 3, 10, 7],
        ["indignant", 4, 7, 8], ["staggered", 3, 11, 8], ["formidable", 5, 5, 9], ["impenetrable", 5, 4, 10]
      ]
    ),
    makeBook(
      {
        id: "pride-prejudice",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        blurb: "礼貌、判断与社交细节很多，适合展示抽象高频词如何细密影响理解。",
        source: "内置演示词库",
        coverage: "前 12 章高频词",
        recommendedRange: [4500, 6000],
        tags: ["经典", "爱情", "社交"]
      },
      [
        ["amiable", 2, 14, 1], ["conceit", 4, 8, 1], ["disdain", 4, 9, 1], ["countenance", 4, 8, 2],
        ["felicity", 4, 7, 2], ["impertinent", 4, 8, 2], ["indolent", 5, 5, 3], ["mortification", 5, 5, 3],
        ["propriety", 4, 9, 3], ["solicitude", 5, 4, 4], ["oblige", 3, 10, 4], ["earnest", 2, 12, 4],
        ["resentment", 3, 11, 5], ["affability", 5, 4, 5], ["vexation", 4, 7, 5], ["decorum", 5, 4, 6],
        ["partiality", 4, 8, 6], ["composure", 3, 10, 6], ["conceited", 3, 10, 7], ["elegance", 2, 13, 7],
        ["civility", 3, 10, 8], ["temper", 2, 13, 9], ["accomplished", 3, 12, 10], ["amiably", 3, 11, 12]
      ]
    ),
    makeBook(
      {
        id: "charlottes-web",
        title: "Charlotte's Web",
        author: "E.B. White",
        blurb: "语言温和清晰，适合刚开始尝试原版阅读的用户建立成就感。",
        source: "内置演示词库",
        coverage: "前 9 章高频词",
        recommendedRange: [1800, 2600],
        tags: ["童话", "成长", "治愈"]
      },
      [
        ["radiant", 2, 14, 1], ["meadow", 2, 13, 1], ["humble", 2, 12, 1], ["gently", 2, 15, 2],
        ["trough", 3, 10, 2], ["shiver", 3, 10, 2], ["earnest", 2, 13, 3], ["murmur", 3, 9, 3],
        ["delightful", 3, 9, 3], ["barn", 2, 15, 4], ["lonesome", 3, 8, 4], ["salutations", 4, 6, 4],
        ["radiance", 3, 8, 5], ["astonishment", 4, 6, 5], ["humiliation", 4, 6, 6], ["companion", 2, 12, 6],
        ["triumph", 3, 8, 7], ["sincere", 2, 11, 7], ["cleverness", 3, 7, 8], ["remarkable", 3, 8, 8],
        ["peculiar", 3, 9, 9], ["glorious", 2, 10, 9], ["tenderly", 3, 8, 9], ["contented", 3, 8, 9]
      ]
    ),
    makeBook(
      {
        id: "the-hobbit",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        blurb: "冒险叙事很强，但会出现不少奇幻场景词和描述词。",
        source: "内置演示词库",
        coverage: "前 7 章高频词",
        recommendedRange: [3600, 4900],
        tags: ["奇幻", "冒险", "经典"]
      },
      [
        ["unexpected", 2, 14, 1], ["mutter", 2, 12, 1], ["respectable", 3, 10, 1], ["mischievous", 4, 7, 1],
        ["wizardry", 4, 7, 2], ["dwarves", 3, 9, 2], ["burglary", 4, 7, 2], ["astonished", 3, 10, 3],
        ["thunderous", 4, 7, 3], ["lurked", 3, 9, 3], ["plunder", 4, 7, 4], ["smoldering", 4, 6, 4],
        ["cavern", 3, 8, 4], ["tremendous", 3, 8, 5], ["wretched", 4, 6, 5], ["invisible", 2, 11, 5],
        ["riddle", 3, 9, 6], ["goblin", 4, 7, 6], ["sting", 2, 11, 6], ["perilous", 4, 6, 7],
        ["gloomy", 3, 8, 7], ["splendid", 2, 10, 7], ["weary", 3, 8, 7], ["courageous", 3, 8, 7]
      ]
    ),
    makeBook(
      {
        id: "the-giver",
        title: "The Giver",
        author: "Lois Lowry",
        blurb: "句式不算复杂，但抽象概念词比较集中，适合过渡阶段用户。",
        source: "内置演示词库",
        coverage: "前 11 章高频词",
        recommendedRange: [3000, 4100],
        tags: ["科幻", "反乌托邦", "校园"]
      },
      [
        ["nurturer", 3, 8, 1], ["apprehensive", 4, 6, 1], ["precision", 3, 9, 2], ["ritual", 3, 9, 2],
        ["reassuring", 3, 8, 2], ["release", 2, 12, 3], ["assignment", 2, 11, 3], ["fret", 3, 8, 3],
        ["capacity", 3, 8, 4], ["transgression", 4, 6, 4], ["shamefaced", 5, 4, 5], ["conspicuous", 4, 6, 5],
        ["sameness", 3, 7, 6], ["privation", 5, 4, 6], ["fragment", 3, 8, 7], ["certainty", 3, 8, 7],
        ["serene", 3, 8, 8], ["urgent", 2, 11, 8], ["bewilderment", 4, 6, 9], ["memory", 2, 12, 9],
        ["transmit", 3, 8, 10], ["frightened", 2, 10, 10], ["integrity", 4, 6, 11], ["carnage", 5, 4, 11]
      ]
    ),
    makeBook(
      {
        id: "percy-jackson-1",
        title: "Percy Jackson and the Lightning Thief",
        author: "Rick Riordan",
        blurb: "节奏快、对白多，适合喜欢冒险和现代叙事的读者。",
        source: "内置演示词库",
        coverage: "前 8 章高频词",
        recommendedRange: [2800, 3900],
        tags: ["奇幻", "冒险", "神话"]
      },
      [
        ["weird", 2, 13, 1], ["groan", 2, 11, 1], ["ambrosia", 4, 6, 1], ["fury", 3, 9, 2],
        ["mythological", 4, 6, 2], ["quest", 3, 9, 2], ["camouflage", 4, 6, 3], ["hover", 3, 8, 3],
        ["betrayal", 3, 8, 4], ["oracle", 4, 6, 4], ["ominous", 4, 6, 4], ["minotaur", 4, 6, 5],
        ["groggy", 3, 8, 5], ["immortal", 3, 8, 5], ["prophecy", 4, 6, 6], ["retrieve", 3, 8, 6],
        ["reckless", 3, 8, 7], ["underworld", 4, 6, 7], ["trident", 4, 6, 7], ["lightning", 2, 11, 8],
        ["shattered", 3, 8, 8], ["bravery", 3, 8, 8], ["companion", 2, 10, 8], ["determined", 2, 10, 8]
      ]
    ),
    makeBook(
      {
        id: "old-man-sea",
        title: "The Old Man and the Sea",
        author: "Ernest Hemingway",
        blurb: "句式简洁，但海上场景词和耐心阅读节奏需要一点适应。",
        source: "内置演示词库",
        coverage: "全书高频词",
        recommendedRange: [2600, 3600],
        tags: ["经典", "自然", "短篇"]
      },
      [
        ["skiff", 3, 9, 1], ["gaunt", 3, 8, 1], ["harpoon", 4, 6, 1], ["sail", 2, 12, 2],
        ["current", 2, 11, 2], ["drift", 3, 8, 2], ["marlin", 4, 6, 3], ["taut", 4, 6, 3],
        ["endure", 3, 8, 4], ["steady", 2, 11, 4], ["gulf", 3, 8, 4], ["hook", 2, 12, 5],
        ["terrific", 3, 7, 5], ["suffering", 3, 8, 5], ["defeated", 2, 10, 6], ["dignity", 3, 8, 6],
        ["shovel", 3, 7, 6], ["mast", 3, 7, 6], ["strange", 2, 11, 7], ["shark", 2, 12, 7],
        ["despair", 3, 7, 7], ["resolve", 3, 7, 8], ["victory", 2, 10, 8], ["respect", 2, 12, 8]
      ]
    )
  ];
}
