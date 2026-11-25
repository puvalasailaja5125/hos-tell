import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LeaveDecision from "@/components/leave-decision";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMonth } from "@/lib/dates";
import { formatRange, leaveLabel, leaveVariant, toDateStr } from "@/lib/leaves";

const FILTERS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

export default async function AdminLeavesPage({ searchParams }) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const filter = FILTERS.some((f) => f.value === params?.status) ? params.status : "PENDING";
  const where = filter === "ALL" ? {} : { status: filter };

  const leaves = await prisma.leaveRequest.findMany({
    where,
    include: { user: { include: { room: true } } },
    orderBy: filter === "PENDING" ? { fromDate: "asc" } : { createdAt: "desc" },
  });

  // Unpaid rent for each tenant in this list
  const unpaid = await prisma.rentPayment.findMany({
    where: { status: "PENDING", userId: { in: leaves.map((l) => l.userId) } },
    orderBy: { month: "desc" },
  });

  const dues = {};
  for (const p of unpaid) {
    dues[p.userId] ??= { total: 0, months: [] };
    dues[p.userId].total += p.amount;
    dues[p.userId].months.push(formatMonth(p.month));
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Leave requests</h1>

      <form method="get" className="mt-6 flex items-center gap-2">
        <select
          name="status"
          defaultValue={filter}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">Filter</Button>
      </form>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Rent dues</TableHead>
            <TableHead>Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No leave requests here.
              </TableCell>
            </TableRow>
          )}
          {leaves.map((l) => {
            const due = dues[l.userId];
            return (
              <TableRow key={l.id}>
                <TableCell className="whitespace-normal">
                  <div className="font-medium">{l.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {l.user.room ? `Room ${l.user.room.number}` : "No room"}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  <div>{formatRange(toDateStr(l.fromDate), toDateStr(l.toDate))}</div>
                  <div className="text-sm text-muted-foreground">{l.reason}</div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {due ? (
                    <div className="text-amber-700 dark:text-amber-400">
                      <div className="font-semibold">{rupees(due.total)} pending</div>
                      <div className="text-xs">{due.months.join(", ")}</div>
                    </div>
                  ) : (
                    <span className="text-green-700 dark:text-green-400">No dues</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {l.status === "PENDING" ? (
                    <LeaveDecision leaveId={l.id} hasDues={Boolean(due)} />
                  ) : (
                    <div className="space-y-1">
                      <Badge variant={leaveVariant(l.status)}>{leaveLabel(l.status)}</Badge>
                      {l.adminNote && <div className="text-sm text-muted-foreground">{l.adminNote}</div>}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}