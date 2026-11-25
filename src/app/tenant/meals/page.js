import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MealGrid from "@/components/meal-grid";
import {
  CUTOFF_HOUR, DEFAULT_OPTED_IN, MEALS, addDays, formatDay, isLocked, toDbDate, todayIST,
} from "@/lib/meals";

export default async function TenantMealsPage() {
  const session = await requireRole("TENANT");

  const today = todayIST();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const rows = await prisma.mealOptIn.findMany({
    where: {
      userId: session.userId,
      date: { gte: toDbDate(dates[0]), lte: toDbDate(dates[6]) },
    },
  });

  const initial = {};
  for (const r of rows) {
    initial[`${r.date.toISOString().slice(0, 10)}|${r.mealType}`] = r.optedIn;
  }

  const days = dates.map((d) => ({ date: d, label: formatDay(d), locked: isLocked(d) }));

  return (
    <div>
      <h1 className="text-3xl font-bold">My meals</h1>
      <p className="mt-2 text-muted-foreground">
        You are eating every meal by default. Tap a meal to skip it so less food is wasted.
        Each day locks at {CUTOFF_HOUR - 12} PM the night before.
      </p>
      <div className="mt-6">
        <MealGrid days={days} meals={MEALS} initial={initial} defaultOptedIn={DEFAULT_OPTED_IN} />
      </div>
    </div>
  );
}