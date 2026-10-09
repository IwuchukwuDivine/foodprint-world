/**
 * Formats an amount stored in kobo (bigint/number, per DATA_MODEL.md money
 * invariant) into a naira display string, e.g. 250000 → "₦2,500".
 */
export default function formatKobo(
  kobo: number | bigint,
  options: { showKobo?: boolean } = {},
): string {
  const value = typeof kobo === "bigint" ? kobo : BigInt(Math.round(kobo));
  const naira = value / 100n;
  const rem = value % 100n < 0n ? -(value % 100n) : value % 100n;
  const whole = new Intl.NumberFormat("en-NG").format(naira);
  if (options.showKobo || rem > 0n) {
    return `₦${whole}.${String(rem).padStart(2, "0")}`;
  }
  return `₦${whole}`;
}
