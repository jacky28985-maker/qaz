import { NextResponse } from "next/server";

// Keep legacy links working, but always use the native InRead CEFR page.
export function GET(request) {
  void request;
  return new NextResponse(null, { status: 307, headers: { location: "/cefr" } });
}
