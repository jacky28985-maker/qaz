import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";
import { readStore, writeStore } from "../../../lib/store";

export const runtime = "nodejs";

function publicAnnotation(note) {
  return {
    id: note.id,
    bookId: note.bookId,
    chapter: note.chapter,
    paragraph: note.paragraph,
    excerpt: note.excerpt,
    content: note.content,
    author: note.author,
    createdAt: note.createdAt,
    likes: Array.isArray(note.likeUserIds) ? note.likeUserIds.length : 0
  };
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function GET(request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("book");
  const chapter = Number.parseInt(searchParams.get("chapter"), 10);
  if (!bookId || !Number.isInteger(chapter)) return NextResponse.json({ error: "INVALID_QUERY" }, { status: 400 });
  const store = readStore();
  const notes = shuffled((store.annotations || []).filter((note) => note.bookId === bookId && note.chapter === chapter && !note.reported))
    .slice(0, 3)
    .map((note) => ({ ...publicAnnotation(note), likedByMe: note.likeUserIds?.includes(user.id) || false }));
  return NextResponse.json({ annotations: notes });
}

export async function POST(request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json();
  const bookId = String(body.bookId || "").trim();
  const chapter = Number.parseInt(body.chapter, 10);
  const paragraph = Number.parseInt(body.paragraph, 10);
  const excerpt = String(body.excerpt || "").trim().slice(0, 220);
  const content = String(body.content || "").trim().slice(0, 280);
  if (!bookId || !Number.isInteger(chapter) || !Number.isInteger(paragraph) || excerpt.length < 2 || content.length < 2) {
    return NextResponse.json({ error: "INVALID_ANNOTATION" }, { status: 400 });
  }
  const store = readStore();
  store.annotations ||= [];
  const note = {
    id: crypto.randomUUID(), bookId, chapter, paragraph, excerpt, content,
    author: { id: user.id, nickname: user.nickname, avatar: user.avatar },
    createdAt: new Date().toISOString(), likeUserIds: [], reported: false
  };
  store.annotations.push(note);
  writeStore(store);
  return NextResponse.json({ annotation: publicAnnotation(note) }, { status: 201 });
}
