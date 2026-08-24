import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";
import { publicUser, readStore, writeStore } from "../../../lib/store";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}

export async function PATCH(request) {
  const activeUser = await currentUser(request);
  if (!activeUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json();
  const store = readStore();
  const user = store.users.find((item) => item.id === activeUser.id);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (body.nickname !== undefined) {
    const nickname = String(body.nickname).trim();
    if (nickname.length < 2 || nickname.length > 24) return NextResponse.json({ error: "昵称需为 2-24 个字符。" }, { status: 400 });
    user.nickname = nickname;
  }
  if (body.avatar !== undefined) {
    const avatar = String(body.avatar).trim();
    if (avatar.length < 1 || avatar.length > 80) return NextResponse.json({ error: "头像内容无效。" }, { status: 400 });
    user.avatar = avatar;
  }
  if (body.learningState !== undefined && typeof body.learningState === "object" && body.learningState !== null) {
    user.profile = user.profile || {};
    user.profile.learningState = body.learningState;
    user.profile.level = body.learningState.readerProfile?.level || body.learningState.result?.level || user.profile.level || "未测试";
  }
  writeStore(store);
  return NextResponse.json({ user: publicUser(user) });
}
