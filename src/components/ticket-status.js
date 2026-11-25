"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TICKET_STATUSES } from "@/lib/tickets";

export default function TicketStatus({ ticketId, status }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    setSaving(true);
    const res = await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: e.target.value }),
    });
    setSaving(false);
    if (!res.ok) alert("Could not update the ticket.");
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={handleChange}
      disabled={saving}
      className="rounded-md border bg-background px-2 py-1 text-sm"
    >
      {TICKET_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}