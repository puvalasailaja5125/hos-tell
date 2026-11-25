import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";

export async function POST(request) {
  const { error, session } = await requireApiRole("TENANT");
  if (error) return error;

  const body = await request.json();
  const title = body.title?.trim();
  const description = body.description?.trim();

  if (!title || title.length < 3 || title.length > 100) {
    return Response.json({ error: "Title must be 3 to 100 characters." }, { status: 400 });
  }
  if (!description || description.length < 5 || description.length > 1000) {
    return Response.json({ error: "Description must be 5 to 1000 characters." }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: { userId: session.userId, title, description },
  });

  return Response.json({ ok: true, id: ticket.id });
}