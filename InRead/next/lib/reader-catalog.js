const bookTitles = {
  "great-gatsby": "The Great Gatsby",
  "harry-potter-1": "Harry Potter and the Sorcerer's Stone",
  "pride-prejudice": "Pride and Prejudice",
  "charlottes-web": "Charlotte's Web",
  "the-hobbit": "The Hobbit",
  "the-giver": "The Giver",
  "percy-jackson-1": "Percy Jackson and the Lightning Thief",
  "old-man-sea": "The Old Man and the Sea"
};

const chapterScenes = [
  { title: "A threshold", focus: "The opening settles the reader into a new place, where small details quietly reveal what matters." },
  { title: "A change in pace", focus: "The scene tightens as a choice changes the direction of the day and gives the characters a reason to act." },
  { title: "Looking ahead", focus: "The chapter closes with a question that carries the reader forward, leaving room for reflection and annotation." }
];

function makeParagraphs(title, chapter) {
  const scene = chapterScenes[chapter - 1];
  return [
    `This server-cached reading edition opens ${title} with a focused chapter view. The page remembers where you stop, so a return visit can continue from the same place.`,
    scene.focus,
    `As you read, select a short passage to attach a private note. You may also share one thought with other readers; public notes are moderated by immediate reporting and only a small random selection appears beside the text.`,
    `InRead keeps the reader anchored in the book rather than turning the page into another word list. Look up what blocks understanding, leave a note when a sentence matters, and then keep reading.`
  ];
}

export function getReaderChapter(bookId, requestedChapter = 1) {
  const title = bookTitles[bookId];
  if (!title) return null;
  const chapter = Math.min(Math.max(Number.parseInt(requestedChapter, 10) || 1, 1), chapterScenes.length);
  const scene = chapterScenes[chapter - 1];
  return {
    bookId,
    title,
    chapter,
    totalChapters: chapterScenes.length,
    chapterTitle: `Chapter ${chapter}: ${scene.title}`,
    paragraphs: makeParagraphs(title, chapter)
  };
}
