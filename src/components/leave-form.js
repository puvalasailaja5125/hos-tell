"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LeaveForm({ minDate }) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFromChange(e) {
    const value = e.target.value;
    setFromDate(value);
    if (!toDate || toDate < value) setToDate(value); // same day by default
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError("");
    setLoading(true);
    const form = new FormData(formEl);
    const res = await fetch("/api/tenant/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDate, toDate, reason: form.get("reason") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    formEl.reset();
    setFromDate("");
    setToDate("");
    toast.success("Leave request sent to the owner.");
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Request leave</CardTitle>
        <CardDescription>
          Going home? Tell the owner in advance. For a single day, pick the same
          date twice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From</Label>
              <Input
                id="fromDate"
                type="date"
                min={minDate}
                value={fromDate}
                onChange={handleFromChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To</Label>
              <Input
                id="toDate"
                type="date"
                min={fromDate || minDate}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              name="reason"
              rows={3}
              placeholder="e.g. Diwali vacation, going home"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-center">
            <Button type="submit" className="min-w-40" disabled={loading}>
              {loading ? "Sending..." : "Send request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
