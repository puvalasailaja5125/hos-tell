import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(session.role === "ADMIN" ? "/admin" : "/tenant");
//   return (
//     <main className="mx-auto max-w-4xl px-6 py-12">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">Welcome, {session.name}</h1>
//         <LogoutButton />
//       </div>
//       <p className="mt-2 text-muted-foreground">You are logged in as {session.role}.</p>
//     </main>
//   );
}
