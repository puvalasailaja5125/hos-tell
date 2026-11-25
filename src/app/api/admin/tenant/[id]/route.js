import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const { error } = await requireApiRole("ADMIN");
  if (error) return error;

  const { id } = await params;
  const { roomId } = await request.json();

  if (roomId !== null && !Number.isInteger(roomId)) {
    return Response.json({ error: "roomId must be a number or null." }, { status: 400 });
  }

  const tenant = await prisma.user.findUnique({ where: { id } });
  if (!tenant || tenant.role !== "TENANT") {
    return Response.json({ error: "Tenant not found." }, { status: 404 });
  }

  if (roomId !== null) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return Response.json({ error: "Room not found." }, { status: 404 });
  }

  await prisma.user.update({ where: { id }, data: { roomId } });
  return Response.json({ ok: true });
}