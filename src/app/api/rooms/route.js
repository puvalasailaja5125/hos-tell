import { prisma } from "./../../../lib/prisma";

export async function GET() {
  const rooms = await prisma.room.findMany({ orderBy: { number: "asc" } });
  return Response.json(rooms);
}