import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;
  const leaveId = Number(id);
  if (!Number.isInteger(leaveId)) {
    return Response.json({ error: "Invalid id." }, { status: 400 });
  }

  const body = await request.json();
  const { status } = body;
  const note = body.note?.trim() || null;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return Response.json({ error: "Status must be APPROVED or REJECTED." }, { status: 400 });
  }
  if (status === "REJECTED" && (!note || note.length < 3)) {
    return Response.json({ error: "Please give a reason for rejecting." }, { status: 400 });
  }
  if (note && note.length > 300) {
    return Response.json({ error: "Note must be at most 300 characters." }, { status: 400 });
  }

  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
  if (!leave) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }
  if (leave.status !== "PENDING") {
    return Response.json({ error: "This request has already been decided." }, { status: 409 });
  }

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status, adminNote: note, decidedAt: new Date() },
  });

  return Response.json({ ok: true });
}