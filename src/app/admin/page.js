import Link from "next/link";
import { ArrowRight, DoorOpen, Plane, Users, Wrench } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonth, formatMonth } from "@/lib/dates";
import {
  DEFAULT_OPTED_IN, MEALS, addDays, formatDay, greeting, toDbDate, todayIST,
} from "@/lib/meals";
import { formatRange, toDateStr } from "@/lib/leaves";
import { formatDate, statusLabel, statusVariant } from "@/lib/tickets";
import StatCard from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default async function AdminPage() {
  const session = await requireRole("ADMIN");

  const month = currentMonth();
  const tomorrow = addDays(todayIST(), 1);

  const [
    tenantCount,
    roomCount,
    occupiedRooms,
    openTicketCount,
    pendingLeaveCount,
    monthPayments,
    outstanding,
    residents,
    mealRows,
    onLeave,
    pendingLeaves,
    openTickets,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.room.count(),
    prisma.room.count({ where: { tenants: { some: {} } } }),
    prisma.ticket.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.rentPayment.findMany({ where: { month } }),
    prisma.rentPayment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
    prisma.user.findMany({
      where: { role: "TENANT", roomId: { not: null } },
      select: { id: true },
    }),
    prisma.mealOptIn.findMany({ where: { date: toDbDate(tomorrow) } }),
    prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        fromDate: { lte: toDbDate(tomorrow) },
        toDate: { gte: toDbDate(tomorrow) },
      },
      select: { userId: true },
    }),
    prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { fromDate: "asc" },
      take: 3,
    }),
    prisma.ticket.findMany({
      where: { status: { not: "RESOLVED" } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  // Rent this month
  const collected = monthPayments.filter((p) => p.status === "PAID").reduce((t, p) => t + p.amount, 0);
  const pendingThisMonth = monthPayments.filter((p) => p.status === "PENDING").reduce((t, p) => t + p.amount, 0);
  const billed = collected + pendingThisMonth;
  const percent = billed > 0 ? Math.round((collected / billed) * 100) : 0;
  const outstandingTotal = outstanding._sum.amount ?? 0;

  // Tomorrow's kitchen headcount (residents, minus opt-outs, minus approved leave)
  const choice = {};
  for (const r of mealRows) choice[`${r.userId}|${r.mealType}`] = r.optedIn;
  const onLeaveIds = new Set(onLeave.map((l) => l.userId));
  const eating = (type) =>
    residents.filter(
      (t) => !onLeaveIds.has(t.id) && (choice[`${t.id}|${type}`] ?? DEFAULT_OPTED_IN)
    ).length;

  // Attention banner
  const attention = [];
  if (pendingLeaveCount > 0) attention.push(`${plural(pendingLeaveCount, "leave request")} to review`);
  if (openTicketCount > 0) attention.push(`${plural(openTicketCount, "open ticket")}`);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">{formatDay(todayIST())}</p>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, {session.name.split(" ")[0]}
        </h1>
      </div>

      {attention.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <div>
            <p className="font-semibold">Needs your attention</p>
            <p className="text-sm">{attention.join(" · ")}</p>
          </div>
          <div className="flex gap-2">
            {pendingLeaveCount > 0 && (
              <Link href="/admin/leaves" className={buttonVariants({ size: "sm" })}>
                Review leaves <ArrowRight className="size-4" />
              </Link>
            )}
            {openTicketCount > 0 && (
              <Link href="/admin/tickets" className={buttonVariants({ size: "sm", variant: "outline" })}>
                View tickets
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Tenants"
          value={tenantCount}
          note={`${residents.length} with a room`}
          href="/admin/tenants"
        />
        <StatCard
          icon={DoorOpen}
          label="Rooms"
          value={roomCount}
          note={`${occupiedRooms} of ${roomCount} occupied`}
        />
        <StatCard
          icon={Wrench}
          label="Open tickets"
          value={openTicketCount}
          note="Maintenance requests"
          href="/admin/tickets"
          alert={openTicketCount > 0}
        />
        <StatCard
          icon={Plane}
          label="Leave requests"
          value={pendingLeaveCount}
          note="Waiting for a decision"
          href="/admin/leaves"
          alert={pendingLeaveCount > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rent · {formatMonth(month)}</CardTitle>
            <CardDescription>Collected so far this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billed === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bills have been generated for this month yet.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-3xl font-bold">{rupees(collected)}</p>
                  <p className="text-sm text-muted-foreground">
                    of {rupees(billed)} billed ({percent}%)
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Pending this month</p>
                    <p className="font-semibold">{rupees(pendingThisMonth)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Outstanding, all months</p>
                    <p className="font-semibold">{rupees(outstandingTotal)}</p>
                  </div>
                </div>
              </>
            )}
            <Link href="/admin/rent" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Manage rent
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tomorrow&apos;s kitchen</CardTitle>
            <CardDescription>
              {formatDay(tomorrow)} · {plural(residents.length, "resident")}
              {onLeaveIds.size > 0 && ` · ${onLeaveIds.size} on leave`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {MEALS.map((m) => (
                <div key={m.type} className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-bold">{eating(m.type)}</p>
                  <p className="text-xs text-muted-foreground">eating</p>
                </div>
              ))}
            </div>
            <Link href="/admin/meals" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Full headcount
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave requests</CardTitle>
            <CardDescription>Waiting for your decision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingLeaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests waiting. You are all caught up.</p>
            ) : (
              <ul className="divide-y">
                {pendingLeaves.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{l.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRange(toDateStr(l.fromDate), toDateStr(l.toDate))}
                      </p>
                    </div>
                    <Link href="/admin/leaves" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Review
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/leaves" className="text-sm underline underline-offset-4">
              View all requests
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open tickets</CardTitle>
            <CardDescription>Latest maintenance requests not yet resolved</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open tickets. Everything is running smoothly.</p>
            ) : (
              <ul className="divide-y">
                {openTickets.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.user.name} · {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/tickets" className="text-sm underline underline-offset-4">
              View all tickets
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}