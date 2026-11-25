import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const { error, session } = await requireApiRole("TENANT");
  if (error) return error;

  const { id } = await params;
  const leaveId = Number(id);
  if (!Number.isInteger(leaveId)) {
    return Response.json({ error: "Invalid id." }, { status: 400 });
  }

  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

  // Same answer for "missing" and "someone else's", so ids can't be probed
  if (!leave || leave.userId !== session.userId) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }
  if (leave.status !== "PENDING") {
    return Response.json({ error: "Only pending requests can be withdrawn." }, { status: 409 });
  }

  await prisma.leaveRequest.delete({ where: { id: leaveId } });
  return Response.json({ ok: true });
}