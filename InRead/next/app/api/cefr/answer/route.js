import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";

export const runtime = "nodejs";

const CEFR_ORIGIN = process.env.CEFR_SERVICE_ORIGIN || "http://127.0.0.1:17860";

export async function POST(request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.session_id || body.session_id !== user.profile?.cefrPendingSession?.id) {
      return NextResponse.json({ error: "INVALID_CEFR_SESSION" }, { status: 403 });
    }
    const response = await fetch(`${CEFR_ORIGIN}/api/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id: body.session_id, choice_index: Number(body.choice_index) }),
      cache: "no-store"
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: "CEFR_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
