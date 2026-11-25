"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "#campaigns", label: "Offers" },
  { href: "#facilities", label: "Facilities" },
  { href: "#menu", label: "Mess menu" },
  { href: "#features", label: "App features" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav({ loggedIn }) {
  const [open, setOpen] = useState(false);

  const actions = loggedIn ? (
    <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
      Dashboard
    </Link>
  ) : (
    <>
      <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        Login
      </Link>
      <Link href="/register" className={buttonVariants({ size: "sm" })}>
        Register
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          Hos-Tell
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">{actions}</div>

        <button
          className="rounded-md p-2 hover:bg-muted md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex gap-2">{actions}</div>
        </div>
      )}
    </header>
  );
}