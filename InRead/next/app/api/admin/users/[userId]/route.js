import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth";
import { publicUser, readStore, writeStore } from "../../../../../lib/store";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    const body = await request.json();
    const { userId } = await params;
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (user.id === admin.id && (body.role === "user" || body.banned === true)) return NextResponse.json({ error: "不能降级或封禁当前管理员。" }, { status: 400 });
    if (body.role !== undefined) {
      if (!["user", "admin"].includes(body.role)) return NextResponse.json({ error: "角色无效。" }, { status: 400 });
      user.role = body.role;
    }
    if (body.banned !== undefined) user.banned = Boolean(body.banned);
    writeStore(store);
    return NextResponse.json({ user: publicUser(user) });
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
}
