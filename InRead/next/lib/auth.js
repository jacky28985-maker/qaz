import { cookies } from "next/headers";
import { getSessionUser, getClientIp } from "./store";

export async function currentUser() {
  const token = (await cookies()).get("inread_session")?.value;
  return getSessionUser(token);
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export function requestIp(request) {
  return getClientIp(request.headers);
}
