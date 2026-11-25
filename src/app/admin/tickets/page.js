import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TicketStatus from "@/components/ticket-status";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, isValidStatus } from "@/lib/tickets";

const FILTERS = [
  { value: "ACTIVE", label: "Active (not resolved)" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "ALL", label: "All" },
];

export default async function AdminTicketsPage({ searchParams }) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const filter = FILTERS.some((f) => f.value === params?.status) ? params.status : "ACTIVE";

  let where = {};
  if (filter === "ACTIVE") where = { status: { not: "RESOLVED" } };
  else if (isValidStatus(filter)) where = { status: filter };

  const tickets = await prisma.ticket.findMany({
    where,
    include: { user: { include: { room: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Maintenance tickets</h1>

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
            <TableHead>Ticket</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Raised</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No tickets here.
              </TableCell>
            </TableRow>
          )}
          {tickets.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="max-w-md whitespace-normal">
                <div className="font-medium">{t.title}</div>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground">{t.description}</div>
              </TableCell>
              <TableCell>
                {t.user.name}
                {t.user.room && (
                  <span className="text-muted-foreground"> · Room {t.user.room.number}</span>
                )}
              </TableCell>
              <TableCell>{formatDate(t.createdAt)}</TableCell>
              <TableCell>
                <TicketStatus ticketId={t.id} status={t.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}