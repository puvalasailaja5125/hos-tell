import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/auth";
import { addDays, isLocked, isMealType, isValidDate, toDbDate, todayIST } from "@/lib/meals";

export async function POST(request) {
  const { error, session } = await requireApiRole("TENANT");
  if (error) return error;

  const { date, mealType, optedIn } = await request.json();

  if (!isValidDate(date) || !isMealType(mealType) || typeof optedIn !== "boolean") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (date > addDays(todayIST(), 14)) {
    return Response.json({ error: "You can only plan 2 weeks ahead." }, { status: 400 });
  }
  if (isLocked(date)) {
    return Response.json({ error: "Choices for this day are locked." }, { status: 403 });
  }

  const dbDate = toDbDate(date);

  // upsert = update if a row exists, otherwise create it
  await prisma.mealOptIn.upsert({
    where: { userId_date_mealType: { userId: session.userId, date: dbDate, mealType } },
    update: { optedIn },
    create: { userId: session.userId, date: dbDate, mealType, optedIn },
  });

  return Response.json({ ok: true });
}