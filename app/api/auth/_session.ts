import { env } from "cloudflare:workers";

type RuntimeEnv = {
  PRON_AUTH_SECRET?: string;
};

const SUPERADMIN_EMAIL_SHA256 =
  "88e0ce076c34f4b41124bf348680fcaf025f8bda0e1e13ad7339be6d6f359cec";
const SUPERADMIN_PASSWORD_SALT = "pron-superadmin-password-v1";
const SUPERADMIN_PASSWORD_PBKDF2 =
  "a13d377e8e39430143be40c7d92fa4e530cacee279bce7f2834c0aff255be3e2";
const FALLBACK_SESSION_SECRET =
  "3b34a27c88abd8754438b3b9bb045330ba1f1fd74dfe73a01339501adaf2587b";
const SESSION_COOKIE = "pron_session";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const superadminProfile = {
  name: "Administrador General",
  role: "Superadministrador",
  access: "Completo",
};

export async function sha256Hex(value: string) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function pbkdf2Hex(value: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(value),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: 210000,
    },
    key,
    256,
  );
  return toHex(bits);
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left: string, right: string) {
  let diff = left.length ^ right.length;
  const max = Math.max(left.length, right.length);

  for (let index = 0; index < max; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return diff === 0;
}

function runtimeSecret() {
  const workerSecret = (env as RuntimeEnv).PRON_AUTH_SECRET;
  const nodeSecret =
    typeof process !== "undefined" ? process.env.PRON_AUTH_SECRET : undefined;

  return workerSecret || nodeSecret || FALLBACK_SESSION_SECRET;
}

async function hmacHex(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(runtimeSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function base64UrlEncode(value: string) {
  const bytes = encoder.encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return decoder.decode(bytes);
}

export async function validateSuperadminCredentials(
  email: string,
  password: string,
) {
  const emailHash = await sha256Hex(email.trim().toLowerCase());
  const passwordHash = await pbkdf2Hex(password, SUPERADMIN_PASSWORD_SALT);

  return (
    timingSafeEqual(emailHash, SUPERADMIN_EMAIL_SHA256) &&
    timingSafeEqual(passwordHash, SUPERADMIN_PASSWORD_PBKDF2)
  );
}

export async function createSessionCookie(remember: boolean, requestUrl: string) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  const expiresAt = Date.now() + maxAge * 1000;
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: "superadmin",
      role: superadminProfile.role,
      exp: expiresAt,
    }),
  );
  const signature = await hmacHex(payload);
  const secure = new URL(requestUrl).protocol === "https:";

  return [
    `${SESSION_COOKIE}=${payload}.${signature}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie(requestUrl: string) {
  const secure = new URL(requestUrl).protocol === "https:";

  return [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=0",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const pair = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return pair ? pair.slice(name.length + 1) : null;
}

export async function readSession(request: Request) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await hmacHex(payload);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as {
      sub?: string;
      role?: string;
      exp?: number;
    };

    if (
      session.sub !== "superadmin" ||
      session.role !== superadminProfile.role ||
      !session.exp ||
      session.exp < Date.now()
    ) {
      return null;
    }

    return {
      user: superadminProfile,
      expiresAt: session.exp,
    };
  } catch {
    return null;
  }
}
