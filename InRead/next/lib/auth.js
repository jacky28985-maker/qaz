import { cookies } from "next/headers";
import { getSessionUser, getClientIp, readStore } from "./store";

export async function currentUser(request) {
  if (request && readStore().bannedIps.includes(getClientIp(request.headers))) return null;
  const token = request?.cookies?.get("inread_session")?.value || (await cookies()).get("inread_session")?.value;
  return getSessionUser(token);
}

export async function requireUser(request) {
  const user = await currentUser(request);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(request) {
  const user = await requireUser(request);
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export function requestIp(request) {
  return getClientIp(request.headers);
}
