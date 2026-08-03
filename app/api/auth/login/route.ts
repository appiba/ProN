import {
  createSessionCookie,
  sha256Hex,
  superadminProfile,
  validateSuperadminCredentials,
} from "../_session";

type LoginPayload = {
  email?: string;
  password?: string;
  remember?: boolean;
};

type AttemptState = {
  count: number;
  lockedUntil: number;
};

const attempts = new Map<string, AttemptState>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 90 * 1000;

function clientKey(request: Request, email: string) {
  const forwardedFor =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "local";

  return `${forwardedFor}:${email.trim().toLowerCase()}`;
}

function registerFailure(key: string) {
  const current = attempts.get(key) ?? { count: 0, lockedUntil: 0 };
  const nextCount = current.count + 1;

  attempts.set(key, {
    count: nextCount,
    lockedUntil: nextCount >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0,
  });
}

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return Response.json(
      { error: "Solicitud invalida. Revisa los datos del formulario." },
      { status: 400 },
    );
  }

  const email = payload.email?.trim() ?? "";
  const password = payload.password ?? "";

  if (!email || !password) {
    return Response.json(
      { error: "Ingresa correo electronico y contrasena." },
      { status: 400 },
    );
  }

  const key = await sha256Hex(clientKey(request, email));
  const attempt = attempts.get(key);

  if (attempt?.lockedUntil && attempt.lockedUntil > Date.now()) {
    return Response.json(
      { error: "Acceso bloqueado temporalmente. Intenta de nuevo en un minuto." },
      { status: 429 },
    );
  }

  const valid = await validateSuperadminCredentials(email, password);

  if (!valid) {
    registerFailure(key);
    return Response.json(
      { error: "Credenciales incorrectas." },
      { status: 401 },
    );
  }

  attempts.delete(key);

  return Response.json(
    {
      user: superadminProfile,
      message: "Sesion iniciada.",
    },
    {
      headers: {
        "Set-Cookie": await createSessionCookie(
          Boolean(payload.remember),
          request.url,
        ),
      },
    },
  );
}
