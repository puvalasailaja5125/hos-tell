"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MealGrid({ days, meals, initial, defaultOptedIn }) {
  const [choices, setChoices] = useState(initial);
  const [error, setError] = useState("");

  const isIn = (date, type) => choices[`${date}|${type}`] ?? defaultOptedIn;

  async function toggle(date, type) {
    const key = `${date}|${type}`;
    const next = !isIn(date, type);
    setError("");
    setChoices((c) => ({ ...c, [key]: next })); // update the screen instantly

    const res = await fetch("/api/tenant/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, mealType: type, optedIn: next }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not save your choice.");
      setChoices((c) => ({ ...c, [key]: !next })); // undo
    }
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            {meals.map((m) => (
              <TableHead key={m.type}>{m.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((d) => (
            <TableRow key={d.date}>
              <TableCell>
                {d.label}
                {d.locked && <span className="ml-2 text-xs text-muted-foreground">(locked)</span>}
              </TableCell>
              {meals.map((m) => {
                const eating = isIn(d.date, m.type);
                return (
                  <TableCell key={m.type}>
                    <Button
                      size="sm"
                      variant={eating ? "default" : "outline"}
                      disabled={d.locked}
                      onClick={() => toggle(d.date, m.type)}
                    >
                      {eating ? "Eating" : "Skipping"}
                    </Button>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}