import { toDbDate } from "@/lib/meals";

export const MAX_LEAVE_DAYS = 90;

export const DEFAULT_DUES_MESSAGE =
  "You have pending rent dues. Leave cannot be approved until your fees are cleared.";

// Date object from the database -> "2026-11-28"
export const toDateStr = (date) => date.toISOString().slice(0, 10);

// Counts both the first and the last day
export const countDays = (from, to) =>
  Math.round((toDbDate(to) - toDbDate(from)) / 86400000) + 1;

const formatLeaveDate = (dateStr) =>
  toDbDate(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export function formatRange(from, to) {
  if (from === to) return `${formatLeaveDate(from)} (1 day)`;
  return `${formatLeaveDate(from)} to ${formatLeaveDate(to)} (${countDays(from, to)} days)`;
}

export const leaveLabel = (s) =>
  s === "APPROVED" ? "Approved" : s === "REJECTED" ? "Rejected" : "Pending";

export const leaveVariant = (s) =>
  s === "APPROVED" ? "default" : s === "REJECTED" ? "destructive" : "secondary";