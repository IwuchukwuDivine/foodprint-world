/**
 * The shop's data shapes. They mirror Foodprint's `vendors`, `menu_sections`,
 * `menu_items`, `option_groups` and `options` tables closely enough that the
 * world could one day read the real API instead of the bundled fixtures.
 */

export type KitchenSlug = string;

export interface OpeningHours {
  /** "08:00" style, 24h. A missing day means closed that day. */
  [day: string]: { open: string; close: string } | undefined;
}

export type StoreState = "open" | "closed" | "paused";

export interface Kitchen {
  slug: KitchenSlug;
  name: string;
  vendorType: "restaurant" | "home_cook";
  description: string;
  logoUrl: string;
  coverUrl: string;
  /** One of the eight Awka districts in utils/data/districts.ts. */
  district: string;
  address: string;
  landmark: string;
  avgPrepMinutes: number;
  ratingAvg: number;
  ratingCount: number;
  featured: boolean;
  storeState: StoreState;
  /** Category slugs, first is the headline cuisine. */
  categories: string[];
  openingHours: OpeningHours;
  /** The 3D model key this kitchen is built from (manifest key). */
  model: string;
  /** The in-world signboard glyph, an Icon name. */
  icon: string;
}

export interface ShopOption {
  id: string;
  name: string;
  priceDeltaKobo: number;
  available: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  min: number;
  max: number;
  required: boolean;
  options: ShopOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceKobo: number;
  photoUrl: string | null;
  available: boolean;
  category: string;
  optionGroups: OptionGroup[];
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

/** One chosen option on a tray line. */
export interface TrayLineOption {
  id: string;
  groupId: string;
  name: string;
  priceDeltaKobo: number;
  quantity: number;
}

export interface TrayLine {
  lineId: string;
  kitchenSlug: KitchenSlug;
  kitchenName: string;
  itemId: string;
  name: string;
  photoUrl: string | null;
  unitPriceKobo: number;
  quantity: number;
  options: TrayLineOption[];
}

export interface District {
  name: string;
  slug: string;
  deliveryFeeKobo: number;
}
