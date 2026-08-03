import { clearSessionCookie } from "../_session";

export async function POST(request: Request) {
  return Response.json(
    { message: "Sesion cerrada." },
    {
      headers: {
        "Set-Cookie": clearSessionCookie(request.url),
      },
    },
  );
}
