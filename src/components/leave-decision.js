"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_DUES_MESSAGE } from "@/lib/leaves";

export default function LeaveDecision({ leaveId, hasDues }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function decide(status) {
    let finalNote = note.trim();
    if (status === "REJECTED" && !finalNote) {
      if (hasDues) {
        finalNote = DEFAULT_DUES_MESSAGE;
      } else {
        return toast.error("Please type a reason for rejecting.");
      }
    }

    setLoading(true);
    const res = await fetch(`/api/admin/leaves/${leaveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: finalNote }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      return toast.error(data.error || "Could not save the decision.");
    }
    toast.success(status === "APPROVED" ? "Leave approved." : "Leave rejected.");
    router.refresh();
  }

  return (
    <div className="w-64 space-y-2">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note to tenant (needed to reject)"
        maxLength={300}
      />
      {hasDues && (
        <p className="text-xs text-muted-foreground">
          Rejecting with this box empty tells the tenant to clear their dues first.
        </p>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => decide("APPROVED")} disabled={loading}>
          Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => decide("REJECTED")} disabled={loading}>
          Reject
        </Button>
      </div>
    </div>
  );
}