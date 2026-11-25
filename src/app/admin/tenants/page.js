import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssignRoom from "@/components/assign-rooms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function TenantsPage() {
  await requireRole("ADMIN");

  const [tenants, rooms] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TENANT" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.room.findMany({ orderBy: { number: "asc" } }),
  ]);

  const roomOptions = rooms.map((r) => ({ id: r.id, number: r.number }));

  return (
    <div>
      <h1 className="text-3xl font-bold">Tenants</h1>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Room</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                No tenants have registered yet.
              </TableCell>
            </TableRow>
          )}
          {tenants.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.email}</TableCell>
              <TableCell>
                <AssignRoom tenantId={t.id} currentRoomId={t.roomId} rooms={roomOptions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}