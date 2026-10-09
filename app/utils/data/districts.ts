import type { District } from "~/utils/types/shop";

/**
 * The eight Awka delivery areas Foodprint launches with, and their fees. The
 * names match the seeded `areas` rows so kitchen data can reference them.
 */
export const DISTRICTS: District[] = [
  { name: "Ifite", slug: "ifite", deliveryFeeKobo: 50_000 },
  { name: "Aroma", slug: "aroma", deliveryFeeKobo: 60_000 },
  { name: "Amawbia", slug: "amawbia", deliveryFeeKobo: 70_000 },
  { name: "Unizik Temp Site", slug: "unizik-temp-site", deliveryFeeKobo: 50_000 },
  { name: "Eke Awka", slug: "eke-awka", deliveryFeeKobo: 60_000 },
  { name: "Udoka Estate", slug: "udoka-estate", deliveryFeeKobo: 70_000 },
  { name: "Agu Awka (GRA)", slug: "agu-awka-gra", deliveryFeeKobo: 70_000 },
  { name: "Okpuno", slug: "okpuno", deliveryFeeKobo: 80_000 },
];

export const DISTRICT_BY_NAME: Record<string, District> = Object.fromEntries(
  DISTRICTS.map((district) => [district.name, district]),
);

export const DISTRICT_BY_SLUG: Record<string, District> = Object.fromEntries(
  DISTRICTS.map((district) => [district.slug, district]),
);
