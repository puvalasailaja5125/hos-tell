"use client";

import { useState } from "react";
import {
  BedDouble, BookOpen, Bike, Cctv, Coffee, Droplets, Lock, ShieldCheck,
  Sparkles, Tv, UtensilsCrossed, WashingMachine, Wifi, Wind, Zap,
} from "lucide-react";

const categories = ["All", "Comfort", "Food", "Safety", "Utilities"];

// EDIT this list to match what your hostel really offers
const facilities = [
  { icon: BedDouble, title: "Furnished rooms", text: "Cot, mattress, study table and wardrobe in every room.", category: "Comfort" },
  { icon: Wind, title: "AC and fan options", text: "Choose the room type that fits your comfort and budget.", category: "Comfort" },
  { icon: BookOpen, title: "Study room", text: "A quiet shared space for exams and assignments.", category: "Comfort" },
  { icon: Sparkles, title: "Daily housekeeping", text: "Clean rooms, corridors and bathrooms every day.", category: "Comfort" },
  { icon: Tv, title: "Common lounge", text: "Relax with friends in the TV and recreation area.", category: "Comfort" },
  { icon: UtensilsCrossed, title: "Home-style meals", text: "Breakfast, lunch, snacks and dinner with a weekly menu.", category: "Food" },
  { icon: Coffee, title: "Tea and snacks", text: "Evening tea with fresh snacks every day.", category: "Food" },
  { icon: Droplets, title: "RO drinking water", text: "Clean, filtered water available around the clock.", category: "Food" },
  { icon: ShieldCheck, title: "24/7 security", text: "Guards on duty day and night for your peace of mind.", category: "Safety" },
  { icon: Cctv, title: "CCTV surveillance", text: "Cameras cover entrances and common areas.", category: "Safety" },
  { icon: Lock, title: "Personal lockers", text: "Keep your valuables and documents secure.", category: "Safety" },
  { icon: Wifi, title: "High-speed Wi-Fi", text: "Fast internet for classes, work and streaming.", category: "Utilities" },
  { icon: Zap, title: "Power backup", text: "No interruptions to your study or work.", category: "Utilities" },
  { icon: WashingMachine, title: "Laundry", text: "Washing machines available for all residents.", category: "Utilities" },
  { icon: Bike, title: "Parking", text: "Safe parking space for two-wheelers.", category: "Utilities" },
];

export default function Facilities() {
  const [active, setActive] = useState("All");
  const visible = active === "All" ? facilities : facilities.filter((f) => f.category === active);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              active === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border bg-card p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}