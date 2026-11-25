import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { isValidStatus } from "@/lib/tickets";

export async function PATCH(request, { params }) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId)) {
    return Response.json({ error: "Invalid ticket id." }, { status: 400 });
  }

  const { status } = await request.json();
  if (!isValidStatus(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return Response.json({ error: "Ticket not found." }, { status: 404 });
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status, resolvedAt: status === "RESOLVED" ? new Date() : null },
  });

  return Response.json({ ok: true });
}