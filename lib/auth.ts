import { cookies } from "next/headers";
import crypto from "crypto";
import { getAdminSupabase } from "./supabase";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET manquant");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

/** Vérifie le mot de passe admin soumis contre le token stocké en base (service role). */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("private_admin_secret")
    .select("token")
    .eq("id", 1)
    .single();

  if (error || !data?.token) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(data.token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function buildSessionCookieValue(): string {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function isValidSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  if (sign(payload) !== signature) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionValue(store.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
