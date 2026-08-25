import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";
import { publicUser } from "../../../lib/store";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}
