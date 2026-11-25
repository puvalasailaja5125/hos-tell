"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function GenerateBills({ month }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generate() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/rent/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? `Created ${data.created} new bill(s).` : data.error);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate bills"}
      </Button>
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
}