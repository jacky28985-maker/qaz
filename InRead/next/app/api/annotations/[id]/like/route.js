import { NextResponse } from "next/server";
import { currentUser } from "../../../../../lib/auth";
import { readStore, writeStore } from "../../../../../lib/store";

export const runtime = "nodejs";

export async function POST(request, context) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await context.params;
  const store = readStore();
  const note = (store.annotations || []).find((item) => item.id === id && !item.reported);
  if (!note) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  note.likeUserIds ||= [];
  const index = note.likeUserIds.indexOf(user.id);
  if (index >= 0) note.likeUserIds.splice(index, 1);
  else note.likeUserIds.push(user.id);
  writeStore(store);
  return NextResponse.json({ likes: note.likeUserIds.length, likedByMe: note.likeUserIds.includes(user.id) });
}
