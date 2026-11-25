import { requireRole } from "@/lib/auth";
import Navbar from "@/components/navbar";

export default async function AdminLayout({ children }) {
  const session = await requireRole("ADMIN");
  return (
    <>
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}