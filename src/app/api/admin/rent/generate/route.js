import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { isValidMonth } from "@/lib/dates";

export async function POST(request) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { month } = await request.json();
  if (!isValidMonth(month)) {
    return Response.json({ error: "Month must look like 2026-11." }, { status: 400 });
  }

  // Only tenants who have a room can be billed
  const tenants = await prisma.user.findMany({
    where: { role: "TENANT", roomId: { not: null } },
    include: { room: true },
  });

  const result = await prisma.rentPayment.createMany({
    data: tenants.map((t) => ({
      userId: t.id,
      month,
      amount: t.room.rentAmount,
    })),
    skipDuplicates: true,
  });

  return Response.json({ ok: true, created: result.count });
}