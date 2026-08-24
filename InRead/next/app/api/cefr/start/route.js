import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";
import { readStore, writeStore } from "../../../../lib/store";

export const runtime = "nodejs";

const CEFR_ORIGIN = process.env.CEFR_SERVICE_ORIGIN || "http://127.0.0.1:17860";

export async function POST(request) {
  const activeUser = await currentUser(request);
  if (!activeUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const response = await fetch(`${CEFR_ORIGIN}/api/start`, { method: "POST", cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.session_id) throw new Error("CEFR start failed");
    const store = readStore();
    const user = store.users.find((item) => item.id === activeUser.id);
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    user.profile = user.profile || {};
    user.profile.cefrPendingSession = { id: payload.session_id, startedAt: new Date().toISOString() };
    writeStore(store);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "CEFR_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
