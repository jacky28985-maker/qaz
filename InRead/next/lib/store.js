import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.INREAD_DATA_DIR || "/app/data";
const storePath = path.join(dataDir, "users.json");
const sessionSecret = process.env.INREAD_SESSION_SECRET || "replace-this-before-production";
const inviteSecret = process.env.INREAD_INVITE_SECRET || sessionSecret;
const adminPassword = process.env.INREAD_ADMIN_PASSWORD || "ChangeMe2026!";

export function passwordIsValid(password) {
  return typeof password === "string" && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,18}$/.test(password);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

export function verifyPassword(password, stored) {
  const [salt, digest] = String(stored || "").split(":");
  if (!salt || !digest) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  if (digest.length !== candidate.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(candidate, "hex"));
}

function createAdmin() {
  return {
    id: crypto.randomUUID(),
    account: "admin",
    nickname: "InRead Admin",
    avatar: "A",
    passwordHash: hashPassword(adminPassword),
    role: "admin",
    banned: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    lastLoginIp: null,
    profile: { level: "未测试", learningState: {} }
  };
}

function ensureStore() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(storePath)) {
    const initial = { users: [createAdmin()], bannedIps: [] };
    fs.writeFileSync(storePath, JSON.stringify(initial, null, 2), "utf8");
  }
}

export function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

export function writeStore(store) {
  ensureStore();
  const tempPath = `${storePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tempPath, storePath);
}

export function publicUser(user) {
  return {
    id: user.id,
    account: user.account,
    nickname: user.nickname,
    avatar: user.avatar,
    role: user.role,
    banned: user.banned,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastLoginIp: user.lastLoginIp,
    profile: user.profile || { level: "未测试", learningState: {} }
  };
}

export function currentInvite() {
  const windowStart = Math.floor(Date.now() / 300000);
  const digest = crypto.createHmac("sha256", inviteSecret).update(`inread:${windowStart}`).digest("hex");
  const code = (Number.parseInt(digest.slice(0, 12), 16) % 100000000).toString().padStart(8, "0");
  return { code, expiresAt: (windowStart + 1) * 300000 };
}

export function createSession(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function getSessionUser(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded.id || decoded.exp < Date.now()) return null;
    return readStore().users.find((user) => user.id === decoded.id && !user.banned) || null;
  } catch {
    return null;
  }
}

export function getClientIp(headers) {
  const forwarded = headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0] : headers.get("x-real-ip") || "unknown").trim();
}
