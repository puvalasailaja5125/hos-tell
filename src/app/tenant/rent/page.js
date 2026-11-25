import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMonth } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

export default async function TenantRentPage() {
  const session = await requireRole("TENANT");

  // The userId comes from the signed cookie, so tenants only ever see their own bills
  const payments = await prisma.rentPayment.findMany({
    where: { userId: session.userId },
    orderBy: { month: "desc" },
  });

  const totalDue = payments
    .filter((p) => p.status === "PENDING")
    .reduce((total, p) => total + p.amount, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold">My rent</h1>

      <Card className="mt-6 max-w-sm">
        <CardHeader>
          <CardDescription>Total due</CardDescription>
          <CardTitle className="text-3xl">{rupees(totalDue)}</CardTitle>
        </CardHeader>
      </Card>

      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid on</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No bills yet.
              </TableCell>
            </TableRow>
          )}
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{formatMonth(p.month)}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}