import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;
  const paymentId = Number(id);
  if (!Number.isInteger(paymentId)) {
    return Response.json({ error: "Invalid payment id." }, { status: 400 });
  }

  const { status } = await request.json();
  if (!["PAID", "PENDING"].includes(status)) {
    return Response.json({ error: "Status must be PAID or PENDING." }, { status: 400 });
  }

  const payment = await prisma.rentPayment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return Response.json({ error: "Payment not found." }, { status: 404 });
  }

  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });

  return Response.json({ ok: true });
}