import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { currentInvite } from "../../../../lib/store";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request);
    return NextResponse.json(currentInvite());
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
}
