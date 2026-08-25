import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { publicUser, readStore } from "../../../../lib/store";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request);
    const query = new URL(request.url).searchParams.get("q")?.toLowerCase().trim() || "";
    const users = readStore().users
      .filter((user) => !query || user.account.includes(query) || user.nickname.toLowerCase().includes(query))
      .map(publicUser);
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
}
