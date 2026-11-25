"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignRoom({ tenantId, currentRoomId, rooms }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const value = e.target.value;
    setSaving(true);
    const res = await fetch(`/api/admin/tenant/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: value === "" ? null : Number(value) }),
    });
    setSaving(false);
    if (!res.ok) alert("Could not update the room.");
    router.refresh();
  }

  return (
    <select
      defaultValue={currentRoomId ?? ""}
      onChange={handleChange}
      disabled={saving}
      className="rounded-md border bg-background px-2 py-1 text-sm"
    >
      <option value="">No room</option>
      {rooms.map((r) => (
        <option key={r.id} value={r.id}>
          Room {r.number}
        </option>
      ))}
    </select>
  );
}