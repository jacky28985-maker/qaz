import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../../lib/auth";
import { passwordIsValid, readStore, writeStore } from "../../../../../../lib/store";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin(request);
    const { password } = await request.json();
    if (!passwordIsValid(password)) return NextResponse.json({ error: "密码需为 6-18 位，并同时包含大小写字母和数字。" }, { status: 400 });
    const { userId } = await params;
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const salt = crypto.randomBytes(16).toString("hex");
    user.passwordHash = `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
    writeStore(store);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
}
