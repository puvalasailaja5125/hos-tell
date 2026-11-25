import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  const user = email
    ? await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    : null;

  const valid = user && password && (await verifyPassword(password, user.passwordHash));
  if (!valid) {
    // Same message for both cases so attackers can't tell which emails exist
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user);
  return Response.json({ ok: true, role: user.role });
}