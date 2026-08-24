import { NextResponse } from "next/server";
import { createSession, publicUser, readStore, verifyPassword, writeStore } from "../../../../lib/store";
import { requestIp } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json();
  const account = String(body.account || "").trim().toLowerCase();
  const store = readStore();
  const ip = requestIp(request);
  if (store.bannedIps.includes(ip)) return NextResponse.json({ error: "该网络地址已被永久封禁。" }, { status: 403 });
  const user = store.users.find((item) => item.account === account);
  if (!user || !verifyPassword(String(body.password || ""), user.passwordHash)) return NextResponse.json({ error: "账号或密码错误。" }, { status: 401 });
  if (user.banned) return NextResponse.json({ error: "该账号已被永久封禁。" }, { status: 403 });
  user.lastLoginAt = new Date().toISOString();
  user.lastLoginIp = ip;
  writeStore(store);
  const response = NextResponse.json({ user: publicUser(user) });
  response.cookies.set("inread_session", createSession(user), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
  return response;
}
