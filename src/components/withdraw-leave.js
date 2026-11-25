"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function WithdrawLeave({ leaveId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function withdraw() {
    if (!confirm("Withdraw this leave request?")) return;
    setLoading(true);
    const res = await fetch(`/api/tenant/leaves/${leaveId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) toast.error("Could not withdraw the request.");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={withdraw} disabled={loading}>
      Withdraw
    </Button>
  );
}