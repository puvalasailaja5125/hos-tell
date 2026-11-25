"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">Please try again. If it keeps happening, contact your PG owner.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}