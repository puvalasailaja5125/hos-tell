"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }) {
  const pathname = usePathname();
  // Home pages must match exactly, others match any sub-path
  const active = href === "/admin" || href === "/tenant" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`text-sm ${
        active ? "font-semibold underline underline-offset-4" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}