import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { addDays, isValidDate, toDbDate, todayIST } from "@/lib/meals";
import { MAX_LEAVE_DAYS, countDays } from "@/lib/leaves";

export async function POST(request) {
  const { error, session } = await requireApiRole("TENANT");
  if (error) return error;

  const body = await request.json();
  const { fromDate, toDate } = body;
  const reason = body.reason?.trim();

  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    return Response.json({ error: "Please choose valid dates." }, { status: 400 });
  }
  if (!reason || reason.length < 5 || reason.length > 300) {
    return Response.json({ error: "Reason must be 5 to 300 characters." }, { status: 400 });
  }

  const today = todayIST();
  if (fromDate <= today) {
    return Response.json(
      { error: "Leave must be requested in advance, starting from tomorrow." },
      { status: 400 }
    );
  }
  if (toDate < fromDate) {
    return Response.json({ error: "The 'to' date cannot be before the 'from' date." }, { status: 400 });
  }
  if (countDays(fromDate, toDate) > MAX_LEAVE_DAYS) {
    return Response.json({ error: `Leave can be at most ${MAX_LEAVE_DAYS} days.` }, { status: 400 });
  }
  if (fromDate > addDays(today, 365)) {
    return Response.json({ error: "You can only request leave within the next year." }, { status: 400 });
  }

  // Overlap check: an existing request that starts before this one ends
  // and ends after this one starts
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      userId: session.userId,
      status: { in: ["PENDING", "APPROVED"] },
      fromDate: { lte: toDbDate(toDate) },
      toDate: { gte: toDbDate(fromDate) },
    },
  });
  if (overlap) {
    return Response.json(
      { error: "You already have a leave request that overlaps these dates." },
      { status: 409 }
    );
  }

  await prisma.leaveRequest.create({
    data: {
      userId: session.userId,
      fromDate: toDbDate(fromDate),
      toDate: toDbDate(toDate),
      reason,
    },
  });

  return Response.json({ ok: true });
}