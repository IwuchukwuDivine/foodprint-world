/**
 * Fee math ported from Foodprint's checkout so the world quotes the same
 * numbers the real product would. Everything is kobo.
 */
export const SERVICE_FEE_BANDS: readonly { upToKobo: number; feeKobo: number }[] = [
  { upToKobo: 500_000, feeKobo: 15_000 },
  { upToKobo: 1_000_000, feeKobo: 25_000 },
  { upToKobo: Number.POSITIVE_INFINITY, feeKobo: 40_000 },
];

/** The service fee for a given food subtotal. */
export function serviceFeeForSubtotal(subtotalKobo: number): number {
  const band = SERVICE_FEE_BANDS.find((b) => subtotalKobo < b.upToKobo);
  return (band ?? SERVICE_FEE_BANDS[SERVICE_FEE_BANDS.length - 1]!).feeKobo;
}

export interface FeeQuote {
  subtotalKobo: number;
  deliveryFeeKobo: number;
  serviceFeeKobo: number;
  totalKobo: number;
}

export function quoteFees(subtotalKobo: number, deliveryFeeKobo: number): FeeQuote {
  const serviceFeeKobo = serviceFeeForSubtotal(subtotalKobo);
  return {
    subtotalKobo,
    deliveryFeeKobo,
    serviceFeeKobo,
    totalKobo: subtotalKobo + deliveryFeeKobo + serviceFeeKobo,
  };
}
