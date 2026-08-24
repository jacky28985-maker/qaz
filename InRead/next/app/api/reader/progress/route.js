import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";
import { publicUser, readStore, writeStore } from "../../../../lib/store";

export const runtime = "nodejs";

function cleanNotes(notes) {
  if (!Array.isArray(notes)) return [];
  return notes.slice(0, 40).map((note) => ({
    id: String(note.id || crypto.randomUUID()),
    chapter: Math.max(1, Math.min(99, Number.parseInt(note.chapter, 10) || 1)),
    paragraph: Math.max(0, Math.min(99, Number.parseInt(note.paragraph, 10) || 0)),
    excerpt: String(note.excerpt || "").trim().slice(0, 220),
    content: String(note.content || "").trim().slice(0, 500),
    createdAt: String(note.createdAt || new Date().toISOString())
  })).filter((note) => note.content);
}

function getProgress(user, bookId) {
  return user.profile?.learningState?.readerProgress?.[bookId] || { chapter: 1, readChapters: [], privateNotes: [] };
}

export async function GET(request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const bookId = new URL(request.url).searchParams.get("book");
  if (!bookId) return NextResponse.json({ error: "BOOK_REQUIRED" }, { status: 400 });
  return NextResponse.json({ progress: getProgress(user, bookId) });
}

export async function PATCH(request) {
  const activeUser = await currentUser(request);
  if (!activeUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json();
  const bookId = String(body.bookId || "").trim();
  if (!bookId) return NextResponse.json({ error: "BOOK_REQUIRED" }, { status: 400 });
  const store = readStore();
  const user = store.users.find((item) => item.id === activeUser.id);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  user.profile ||= {};
  user.profile.learningState ||= {};
  user.profile.learningState.readerProgress ||= {};
  const previous = getProgress(user, bookId);
  const chapter = Math.max(1, Math.min(99, Number.parseInt(body.chapter, 10) || previous.chapter || 1));
  user.profile.learningState.readerProgress[bookId] = {
    chapter,
    readChapters: [...new Set([...(previous.readChapters || []), chapter])].slice(-99),
    privateNotes: body.privateNotes === undefined ? previous.privateNotes || [] : cleanNotes(body.privateNotes),
    updatedAt: new Date().toISOString()
  };
  writeStore(store);
  return NextResponse.json({ progress: user.profile.learningState.readerProgress[bookId], user: publicUser(user) });
}
