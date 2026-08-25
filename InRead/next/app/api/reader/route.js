import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";
import { getReaderChapter } from "../../../lib/reader-catalog";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const chapter = getReaderChapter(searchParams.get("book"), searchParams.get("chapter"));
  if (!chapter) return NextResponse.json({ error: "BOOK_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ chapter });
}
