import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { readStore, writeStore } from "../../../../lib/store";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireAdmin(request);
    const ip = String((await request.json()).ip || "").trim();
    if (!/^[0-9a-fA-F:.]+$/.test(ip)) return NextResponse.json({ error: "IP 地址无效。" }, { status: 400 });
    const store = readStore();
    if (!store.bannedIps.includes(ip)) store.bannedIps.push(ip);
    writeStore(store);
    return NextResponse.json({ bannedIps: store.bannedIps });
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
}
