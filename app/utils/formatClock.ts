/** An ISO timestamp as "14:32". */
export default function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
