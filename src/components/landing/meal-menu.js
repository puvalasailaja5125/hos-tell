"use client";

import { useEffect, useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mealNames = ["Breakfast", "Lunch", "Snacks", "Dinner"];

// SAMPLE menu. EDIT it to match your mess.
const menu = {
  Mon: ["Idli, sambar and chutney", "Rice, dal, aloo fry, curd", "Tea and biscuits", "Chapati and paneer curry"],
  Tue: ["Poha and tea", "Rice, sambar, cabbage poriyal", "Tea and samosa", "Jeera rice and dal tadka"],
  Wed: ["Upma and chutney", "Veg pulao and raita", "Sprouts chaat", "Chapati and mixed veg curry"],
  Thu: ["Dosa and sambar", "Rice, rasam, beans fry", "Tea and mirchi bajji", "Chapati and egg or paneer curry"],
  Fri: ["Aloo paratha and curd", "Rice, dal, bhindi fry", "Tea and biscuits", "Veg biryani and raita"],
  Sat: ["Pongal and vada", "Rice, sambar, potato fry", "Corn chaat", "Fried rice and manchurian"],
  Sun: ["Puri and bhaji", "Biryani and raita", "Tea and cake", "Khichdi and papad"],
};

export default function MealMenu() {
  const [day, setDay] = useState("Mon");

  // Open on today's day (runs in the browser after the page loads)
  useEffect(() => {
    setDay(days[(new Date().getDay() + 6) % 7]);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              day === d ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mealNames.map((name, i) => (
          <div key={name} className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{name}</p>
            <p className="mt-2 font-semibold">{menu[day][i]}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Sample menu. It may change by season.</p>
    </div>
  );
}