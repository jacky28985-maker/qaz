import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";
import { getPublicGrammarQuestion } from "./shared";

export const runtime = "nodejs";

export async function GET(request) {
  const activeUser = await currentUser(request);
  if (!activeUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const session = activeUser.profile?.grammarPendingSession;
  if (!session?.id) {
    return NextResponse.json({ status: "idle" });
  }

  return NextResponse.json({
    status: "in_progress",
    sessionId: session.id,
    question: getPublicGrammarQuestion(session),
    progress: {
      answered: session.answers?.length || 0,
      total: session.questions?.length || 20
    }
  });
}
