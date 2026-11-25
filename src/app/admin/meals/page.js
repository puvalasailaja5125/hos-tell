import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_OPTED_IN,
  MEALS,
  addDays,
  formatDay,
  isValidDate,
  toDbDate,
  todayIST,
} from "@/lib/meals";

export default async function AdminMealsPage({ searchParams }) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const date = isValidDate(params?.date) ? params.date : addDays(todayIST(), 1);

  // Only tenants who live here (have a room) are counted
  const tenants = await prisma.user.findMany({
    where: { role: "TENANT", roomId: { not: null } },
    orderBy: { name: "asc" },
  });

  const rows = await prisma.mealOptIn.findMany({
    where: { date: toDbDate(date), userId: { in: tenants.map((t) => t.id) } },
  });

  // Tenants on approved leave on this date are not eating
  const onLeave = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      fromDate: { lte: toDbDate(date) },
      toDate: { gte: toDbDate(date) },
    },
    select: { userId: true },
  });
  const onLeaveIds = new Set(onLeave.map((l) => l.userId));

  const choice = {};
  for (const r of rows) choice[`${r.userId}|${r.mealType}`] = r.optedIn;
  const isEating = (userId, type) =>
    !onLeaveIds.has(userId) &&
    (choice[`${userId}|${type}`] ?? DEFAULT_OPTED_IN);

  const counts = MEALS.map((m) => ({
    ...m,
    eating: tenants.filter((t) => isEating(t.id, m.type)).length,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold">Meals · {formatDay(date)}</h1>

      <form method="get" className="mt-6 flex items-center gap-2">
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        />
        <Button type="submit" variant="outline" size="sm">
          View
        </Button>
      </form>

      <div className="mt-6 grid gap-6 md:grid-cols-4">
        {counts.map((c) => (
          <Card key={c.type}>
            <CardHeader>
              <CardDescription>{c.label}</CardDescription>
              <CardTitle className="text-4xl">{c.eating}</CardTitle>
              <CardDescription>of {tenants.length} eating</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            {MEALS.map((m) => (
              <TableHead key={m.type}>{m.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={MEALS.length + 1}
                className="text-muted-foreground"
              >
                No tenants with rooms yet.
              </TableCell>
            </TableRow>
          )}
          {tenants.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.name}</TableCell>
              {MEALS.map((m) => (
                <TableCell key={m.type}>
                  {onLeaveIds.has(t.id)
                    ? "On leave"
                    : isEating(t.id, m.type)
                      ? "✓"
                      : "✗"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
