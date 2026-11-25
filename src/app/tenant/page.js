import Link from "next/link";
import { ArrowRight, BedDouble, CircleCheck, Wallet, Wrench } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMonth } from "@/lib/dates";
import {
  CUTOFF_HOUR, DEFAULT_OPTED_IN, MEALS, addDays, formatDay, hourIST, isLocked, toDbDate, todayIST,
} from "@/lib/meals";
import { formatDate, statusLabel, statusVariant } from "@/lib/tickets";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

function greeting() {
  const h = hourIST();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function StatCard({ icon: Icon, label, value, note, href }) {
  const content = (
    <Card className={href ? "h-full transition hover:shadow-md" : "h-full"}>
      <CardContent className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function TenantPage() {
  const session = await requireRole("TENANT");
  const userId = session.userId;
  const tomorrow = addDays(todayIST(), 1);

  const [user, pendingBills, openTickets, recentTickets, mealRows] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { room: true } }),
    prisma.rentPayment.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { month: "asc" },
    }),
    prisma.ticket.count({ where: { userId, status: { not: "RESOLVED" } } }),
    prisma.ticket.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.mealOptIn.findMany({ where: { userId, date: toDbDate(tomorrow) } }),
  ]);

  const due = pendingBills.reduce((total, p) => total + p.amount, 0);
  const firstName = user.name.split(" ")[0];

  const choice = {};
  for (const r of mealRows) choice[r.mealType] = r.optedIn;
  const locked = isLocked(tomorrow);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">{formatDay(todayIST())}</p>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, {firstName}
        </h1>
      </div>

      {/* Rent status banner (only for tenants who have a room) */}
      {user.room &&
        (due > 0 ? (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <div>
              <p className="font-semibold">{rupees(due)} rent pending</p>
              <p className="text-sm">Oldest unpaid bill: {formatMonth(pendingBills[0].month)}</p>
            </div>
            <Link href="/tenant/rent" className={buttonVariants({ size: "sm" })}>
              View bills <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
            <CircleCheck className="size-5" />
            <p className="font-semibold">You are all paid up. Thank you!</p>
          </div>
        ))}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={BedDouble}
          label="Your room"
          value={user.room ? `Room ${user.room.number}` : "Not assigned"}
          note={user.room ? "Your home at the PG" : "Ask your PG owner"}
        />
        <StatCard
          icon={Wallet}
          label="Monthly rent"
          value={user.room ? rupees(user.room.rentAmount) : "-"}
          note="Due every month"
          href="/tenant/rent"
        />
        <StatCard
          icon={Wrench}
          label="Open tickets"
          value={openTickets}
          note="Maintenance requests"
          href="/tenant/tickets"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tomorrow&apos;s meals</CardTitle>
            <CardDescription>
              {formatDay(tomorrow)} ·{" "}
              {locked ? "Locked for the kitchen" : `Change until ${CUTOFF_HOUR - 12} PM tonight`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {MEALS.map((m) => {
                const eating = choice[m.type] ?? DEFAULT_OPTED_IN;
                return (
                  <div key={m.type} className={`rounded-lg border p-3 ${eating ? "" : "opacity-60"}`}>
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                    <p className={`font-semibold ${eating ? "text-primary" : "line-through"}`}>
                      {eating ? "Eating" : "Skipping"}
                    </p>
                  </div>
                );
              })}
            </div>
            <Link href="/tenant/meals" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Manage meals
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent tickets</CardTitle>
            <CardDescription>Your latest maintenance requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tickets yet. Everything is running smoothly.
              </p>
            ) : (
              <ul className="divide-y">
                {recentTickets.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                    </div>
                    <Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/tenant/tickets" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Report a problem
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}