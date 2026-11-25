"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import LogoutButton from "@/components/logout-button";

export default function Navbar({ session }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links =
    session.role === "ADMIN"
      ? [
          { href: "/admin", label: "Overview" },
          { href: "/admin/tenants", label: "Tenants" },
          { href: "/admin/rent", label: "Rent" },
          { href: "/admin/meals", label: "Meals" },
          { href: "/admin/tickets", label: "Tickets" },
          { href: "/admin/leaves", label: "Leaves" },
        ]
      : [
          { href: "/tenant", label: "My Dashboard" },
          { href: "/tenant/rent", label: "Rent" },
          { href: "/tenant/meals", label: "Meals" },
          { href: "/tenant/tickets", label: "Tickets" },
          { href: "/tenant/leaves", label: "Leave" },
        ];

  const isActive = (href) =>
    href === "/admin" || href === "/tenant" ? pathname === href : pathname.startsWith(href);

  const linkClass = (href) =>
    `rounded-md px-3 py-2 text-sm transition ${
      isActive(href)
        ? "bg-primary/10 font-semibold text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="font-heading text-lg font-bold text-primary">
          Hos-Tell
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="text-sm text-muted-foreground">{session.name}</span>
          <LogoutButton />
        </div>

        <button
          className="rounded-md p-2 hover:bg-muted lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">
              {session.name} ({session.role})
            </span>
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  );
}