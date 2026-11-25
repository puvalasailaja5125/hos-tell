import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  const { name, email, password } = await request.json();

  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return Response.json(
      { error: "Name, email and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return Response.json({ error: "This email is already registered." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      // role is NOT taken from the request. It defaults to TENANT.
    },
  });

  await createSession(user);
  return Response.json({ ok: true, role: user.role });
}