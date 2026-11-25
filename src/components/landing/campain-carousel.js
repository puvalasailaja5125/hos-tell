"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// EDIT these slides to match your real offers and campaigns
const slides = [
  {
    tag: "Welcome offer",
    title: "Your first week of meals is on us",
    text: "Move in this month and enjoy the mess free for 7 days.",
    cta: "Register now",
    href: "/register",
    bg: "from-indigo-600 to-violet-600",
  },
  {
    tag: "Refer a friend",
    title: "Bring a friend, save on rent",
    text: "Get ₹500 off your next month's rent when a friend moves in.",
    cta: "Get started",
    href: "/register",
    bg: "from-emerald-600 to-teal-600",
  },
  {
    tag: "Going home?",
    title: "Request leave in a few taps",
    text: "Tell the owner in advance, and you are skipped from the kitchen headcount while you are away.",
    cta: "Login to request leave",
    href: "/login",
    bg: "from-orange-500 to-rose-500",
  },
  {
    tag: "Zero food waste",
    title: "Skip a meal, save a plate",
    text: "Opt out of any meal before 10 PM the night before. The kitchen cooks only what is needed.",
    cta: "See how it works",
    href: "#features",
    bg: "from-sky-600 to-cyan-600",
  },
];

export default function CampaignCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const go = (n) => setIndex((n + slides.length) % slides.length);

  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div key={s.title} className={`min-w-full bg-gradient-to-br ${s.bg} px-6 py-12 text-white sm:px-14 sm:py-16`}>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{s.tag}</span>
            <h3 className="mt-4 max-w-xl text-2xl font-bold sm:text-4xl">{s.title}</h3>
            <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">{s.text}</p>
            <Link href={s.href} className={`${buttonVariants({ variant: "secondary" })} mt-6`}>
              {s.cta}
            </Link>
          </div>
        ))}
      </div>

      <button
        aria-label="Previous offer"
        onClick={() => go(index - 1)}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30 sm:block"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        aria-label="Next offer"
        onClick={() => go(index + 1)}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30 sm:block"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.title}
            aria-label={`Go to offer ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full bg-white transition-all ${i === index ? "w-6" : "w-2 opacity-50"}`}
          />
        ))}
      </div>
    </div>
  );
}