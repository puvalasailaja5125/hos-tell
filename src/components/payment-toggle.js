"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentToggle({ paymentId, status }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/admin/rent/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "PAID" ? "PENDING" : "PAID" }),
    });
    setLoading(false);
    if (!res.ok) alert("Could not update the payment.");
    router.refresh();
  }

  return (
    <Button
      size="sm"
      variant={status === "PAID" ? "outline" : "default"}
      onClick={toggle}
      disabled={loading}
    >
      {status === "PAID" ? "Mark unpaid" : "Mark paid"}
    </Button>
  );
}