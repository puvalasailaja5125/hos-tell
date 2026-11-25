import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/reset";
import { sendResetEmail } from "@/lib/mail";

export async function POST(request) {
  const { email } = await request.json();
  if (typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  if (user) {
    // At most one reset email per minute for each account
    const recent = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
    });

    if (!recent) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      const token = generateToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + 30 * 60_000),
        },
      });

      const link = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
      try {
        await sendResetEmail(user.email, user.name, link);
      } catch (err) {
        console.error("Could not send reset email:", err);
      }
    }
  }

  // Same answer whether or not the account exists
  return Response.json({ ok: true });
}