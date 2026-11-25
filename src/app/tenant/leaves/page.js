import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LeaveForm from "@/components/leave-form";
import WithdrawLeave from "@/components/withdraw-leave";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { addDays, todayIST } from "@/lib/meals";
import { formatRange, leaveLabel, leaveVariant, toDateStr } from "@/lib/leaves";

export default async function TenantLeavesPage() {
  const session = await requireRole("TENANT");

  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const minDate = addDays(todayIST(), 1);

  return (
    <div>
      <h1 className="text-3xl font-bold">Leave</h1>
      <div className="mt-6">
        <LeaveForm minDate={minDate} />
      </div>

      <h2 className="mt-10 text-xl font-semibold">My requests</h2>
      <div className="mt-4 space-y-4">
        {leaves.length === 0 && (
          <p className="text-sm text-muted-foreground">You have not requested any leave.</p>
        )}

        {leaves.map((l) => (
          <Card key={l.id}>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{formatRange(toDateStr(l.fromDate), toDateStr(l.toDate))}</p>
                <Badge variant={leaveVariant(l.status)}>{leaveLabel(l.status)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Reason: {l.reason}</p>

              {l.status === "PENDING" && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">Waiting for the owner to review your request.</p>
                  <WithdrawLeave leaveId={l.id} />
                </div>
              )}

              {l.status === "APPROVED" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
                  <p className="font-semibold">Approved. Happy journey! Enjoy your vacation.</p>
                  {l.adminNote && <p className="mt-1 text-sm">Note from the owner: {l.adminNote}</p>}
                </div>
              )}

              {l.status === "REJECTED" && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                  <p className="font-semibold">Not approved</p>
                  <p className="mt-1 text-sm">{l.adminNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}