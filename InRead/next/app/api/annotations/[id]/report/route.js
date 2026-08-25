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
  note.reported = true;
  note.reportedAt = new Date().toISOString();
  note.reportedBy = user.id;
  writeStore(store);
  return NextResponse.json({ removed: true });
}
