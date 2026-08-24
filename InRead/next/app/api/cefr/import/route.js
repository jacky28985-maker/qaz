import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";
import { publicUser, readStore, writeStore } from "../../../../lib/store";

export const runtime = "nodejs";

const CEFR_ORIGIN = process.env.CEFR_SERVICE_ORIGIN || "http://127.0.0.1:17860";
const VOCABULARY_BY_LEVEL = { A1: 800, A2: 1800, B1: 3500, B2: 5500, C1: 7800, C2: 10500 };

export async function POST(request) {
  const activeUser = await currentUser(request);
  if (!activeUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const { session_id: sessionId } = await request.json();
    if (!sessionId || sessionId !== activeUser.profile?.cefrPendingSession?.id) {
      return NextResponse.json({ error: "INVALID_CEFR_SESSION" }, { status: 403 });
    }
    const verifyResponse = await fetch(`${CEFR_ORIGIN}/api/state?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
    const verified = await verifyResponse.json();
    if (!verifyResponse.ok || verified.status !== "finished" || !verified.result) {
      return NextResponse.json({ error: "CEFR_RESULT_NOT_READY" }, { status: 409 });
    }
    const result = verified.result;
    const level = String(result.cefr_level || "").toUpperCase();
    const estimatedVocab = VOCABULARY_BY_LEVEL[level];
    if (!estimatedVocab) return NextResponse.json({ error: "INVALID_CEFR_RESULT" }, { status: 422 });

    const store = readStore();
    const user = store.users.find((item) => item.id === activeUser.id);
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    user.profile = user.profile || {};
    const learningState = user.profile.learningState || {};
    user.profile.learningState = {
      ...learningState,
      result: null,
      plan: [],
      studySession: null,
      readerProfile: {
        estimatedVocab,
        level,
        sourceBook: `CEFR ${level}`,
        sourceLevel: level,
        unknownCount: null,
        assessment: { type: `cefr-${level}`, score: level, source: "cefr-tool", completedAt: new Date().toISOString() }
      },
      cefrAssessment: { ...result, completedAt: new Date().toISOString() }
    };
    user.profile.level = level;
    delete user.profile.cefrPendingSession;
    writeStore(store);
    return NextResponse.json({ ok: true, result, user: publicUser(user) });
  } catch {
    return NextResponse.json({ error: "CEFR_SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}
