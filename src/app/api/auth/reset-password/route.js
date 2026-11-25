import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { hashToken } from "@/lib/reset";

export async function POST(request) {
  const { token, password } = await request.json();

  if (typeof token !== "string" || typeof password !== "string" || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.expiresAt < new Date()) {
    return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return Response.json({ ok: true });
}