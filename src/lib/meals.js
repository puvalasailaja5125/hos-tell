export const MEALS = [
  { type: "BREAKFAST", label: "Breakfast" },
  { type: "LUNCH", label: "Lunch" },
  { type: "SNACKS", label: "Snacks" },
  { type: "DINNER", label: "Dinner" },
];

export const CUTOFF_HOUR = 22; // choices for a day lock at 10 PM the night before
export const DEFAULT_OPTED_IN = true; // no row = the tenant is eating

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isMealType = (t) => MEALS.some((m) => m.type === t);

// "2026-11-22" -> Date at midnight UTC (how Prisma stores @db.Date)
export const toDbDate = (dateStr) => new Date(`${dateStr}T00:00:00.000Z`);

export function isValidDate(dateStr) {
  return (
    typeof dateStr === "string" &&
    DATE_RE.test(dateStr) &&
    !Number.isNaN(toDbDate(dateStr).getTime())
  );
}

// Today's date in India, like "2026-11-21"
export function todayIST() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export function hourIST() {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date())
  );
}

export function addDays(dateStr, n) {
  const d = toDbDate(dateStr);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// A day is locked once the cutoff on the previous evening has passed
export function isLocked(dateStr) {
  const today = todayIST();
  const dayBefore = addDays(dateStr, -1);
  if (today > dayBefore) return true;
  if (today === dayBefore) return hourIST() >= CUTOFF_HOUR;
  return false;
}

// "2026-11-22" -> "Sun, 22 Nov"
export function formatDay(dateStr) {
  return toDbDate(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function greeting() {
  const h = hourIST();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}