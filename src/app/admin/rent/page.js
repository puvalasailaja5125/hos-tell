import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonth, formatMonth, isValidMonth } from "@/lib/dates";
import GenerateBills from "@/components/generate-bills";
import PaymentToggle from "@/components/payment-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

export default async function AdminRentPage({ searchParams }) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const month = isValidMonth(params?.month) ? params.month : currentMonth();

  const payments = await prisma.rentPayment.findMany({
    where: { month },
    include: { user: { include: { room: true } } },
    orderBy: { user: { name: "asc" } },
  });

  const sum = (status) =>
    payments.filter((p) => p.status === status).reduce((total, p) => total + p.amount, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold">Rent · {formatMonth(month)}</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <form method="get" className="flex items-center gap-2">
          <input
            type="month"
            name="month"
            defaultValue={month}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          />
          <Button type="submit" variant="outline" size="sm">View</Button>
        </form>
        <GenerateBills month={month} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Collected</CardDescription>
            <CardTitle className="text-3xl">{rupees(sum("PAID"))}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{rupees(sum("PENDING"))}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid on</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No bills for this month yet. Click "Generate bills".
              </TableCell>
            </TableRow>
          )}
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.user.name}</TableCell>
              <TableCell>{p.user.room ? p.user.room.number : "-"}</TableCell>
              <TableCell>{rupees(p.amount)}</TableCell>
              <TableCell>
                <Badge variant={p.status === "PAID" ? "default" : "outline"}>
                  {p.status === "PAID" ? "Paid" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                {p.paidAt
                  ? p.paidAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <PaymentToggle paymentId={p.id} status={p.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}