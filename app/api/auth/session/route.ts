import { readSession } from "../_session";

export async function GET(request: Request) {
  const session = await readSession(request);

  return Response.json({
    authenticated: Boolean(session),
    user: session?.user ?? null,
  });
}
