import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TicketForm from "@/components/ticket-form";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, statusLabel, statusVariant } from "@/lib/tickets";

export default async function TenantTicketsPage() {
  const session = await requireRole("TENANT");

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Maintenance</h1>
      <div className="mt-6">
        <TicketForm />
      </div>

      <h2 className="mt-10 text-xl font-semibold">My tickets</h2>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Raised</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Resolved on</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                You have not raised any tickets.
              </TableCell>
            </TableRow>
          )}
          {tickets.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="max-w-md whitespace-normal">
                <div className="font-medium">{t.title}</div>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground">{t.description}</div>
              </TableCell>
              <TableCell>{formatDate(t.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge>
              </TableCell>
              <TableCell>{t.resolvedAt ? formatDate(t.resolvedAt) : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}