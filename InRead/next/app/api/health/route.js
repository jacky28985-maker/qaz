export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    service: "InRead",
    version: "2.0.0",
    status: "ok",
    timestamp: new Date().toISOString()
  });
}
