import formatClock from "~/utils/formatClock";

/** "Today, 14:32" or "9 Oct, 14:32" for the order history list. */
export default function formatShortDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const day = sameDay
    ? "Today"
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${day}, ${formatClock(iso)}`;
}
