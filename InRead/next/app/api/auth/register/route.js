import { NextResponse } from "next/server";
import { currentInvite, passwordIsValid, publicUser, readStore, writeStore } from "../../../../lib/store";
import crypto from "node:crypto";

export const runtime = "nodejs";

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

export async function POST(request) {
  const body = await request.json();
  const account = String(body.account || "").trim().toLowerCase();
  const nickname = String(body.nickname || "").trim();
  const password = String(body.password || "");
  const inviteCode = String(body.inviteCode || "").trim();
  if (!/^[a-z0-9_]{3,24}$/.test(account)) return NextResponse.json({ error: "账号需为 3-24 位小写字母、数字或下划线。" }, { status: 400 });
  if (nickname.length < 2 || nickname.length > 24) return NextResponse.json({ error: "昵称需为 2-24 个字符。" }, { status: 400 });
  if (!passwordIsValid(password)) return NextResponse.json({ error: "密码需为 6-18 位，并同时包含大小写字母和数字。" }, { status: 400 });
  if (inviteCode !== currentInvite().code) return NextResponse.json({ error: "邀请码无效或已过期。" }, { status: 400 });
  const store = readStore();
  if (store.users.some((user) => user.account === account)) return NextResponse.json({ error: "该账号已存在。" }, { status: 409 });
  const user = {
    id: crypto.randomUUID(), account, nickname, avatar: nickname.slice(0, 1).toUpperCase(), passwordHash: hashPassword(password),
    role: "user", banned: false, createdAt: new Date().toISOString(), lastLoginAt: null, lastLoginIp: null,
    profile: { level: "未测试", learningState: {} }
  };
  store.users.push(user);
  writeStore(store);
  return NextResponse.json({ user: publicUser(user) }, { status: 201 });
}
