export const TICKET_STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export const isValidStatus = (s) => TICKET_STATUSES.some((t) => t.value === s);

export const statusLabel = (s) => TICKET_STATUSES.find((t) => t.value === s)?.label ?? s;

// Badge colour for each status
export const statusVariant = (s) =>
  s === "RESOLVED" ? "default" : s === "IN_PROGRESS" ? "secondary" : "outline";

export const formatDate = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });