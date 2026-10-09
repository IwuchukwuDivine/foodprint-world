import type { OptionGroup, ShopOption } from "~/utils/types/shop";

/**
 * The option sets the demo menus share. A set is keyed by a kebab id and
 * carries the seed's group name; menus attach one to an item through
 * `optionGroup()`, which stamps the per-item id and min/max/required.
 *
 * Prices are kobo deltas on top of the item price. "Prawns" is deliberately
 * unavailable so an item sheet has one sold-out option to render.
 */
export const OPTION_SETS: Record<
  string,
  { name: string; options: Omit<ShopOption, "id">[] }
> = {
  "choose-your-protein": {
    name: "Choose your protein",
    options: [
      { name: "Chicken", priceDeltaKobo: 0, available: true },
      { name: "Beef", priceDeltaKobo: 20_000, available: true },
      { name: "Goat meat", priceDeltaKobo: 50_000, available: true },
      { name: "Fish", priceDeltaKobo: 40_000, available: true },
      { name: "Prawns", priceDeltaKobo: 80_000, available: false },
    ],
  },
  "add-extras": {
    name: "Add extras",
    options: [
      { name: "Extra plantain", priceDeltaKobo: 50_000, available: true },
      { name: "Coleslaw", priceDeltaKobo: 60_000, available: true },
      { name: "Moi moi", priceDeltaKobo: 80_000, available: true },
      { name: "Chilled soft drink", priceDeltaKobo: 50_000, available: true },
    ],
  },
  "choose-your-swallow": {
    name: "Choose your swallow",
    options: [
      { name: "Pounded yam", priceDeltaKobo: 0, available: true },
      { name: "Semovita", priceDeltaKobo: 0, available: true },
      { name: "Eba (garri)", priceDeltaKobo: 0, available: true },
      { name: "Fufu", priceDeltaKobo: 0, available: true },
    ],
  },
  "extra-protein": {
    name: "Extra protein",
    options: [
      { name: "Goat meat", priceDeltaKobo: 80_000, available: true },
      { name: "Stockfish", priceDeltaKobo: 100_000, available: true },
      { name: "Shaki (tripe)", priceDeltaKobo: 60_000, available: true },
      { name: "Dried fish", priceDeltaKobo: 70_000, available: true },
    ],
  },
  "extra-swallow": {
    name: "Extra swallow",
    options: [
      { name: "Extra fufu wrap", priceDeltaKobo: 50_000, available: true },
      { name: "Extra pounded yam", priceDeltaKobo: 60_000, available: true },
      { name: "Extra semo wrap", priceDeltaKobo: 40_000, available: true },
    ],
  },
  "spice-level": {
    name: "Spice level",
    options: [
      { name: "Mild", priceDeltaKobo: 0, available: true },
      { name: "Medium", priceDeltaKobo: 0, available: true },
      { name: "Hot", priceDeltaKobo: 0, available: true },
      { name: "Kill me", priceDeltaKobo: 0, available: true },
    ],
  },
  "suya-extras": {
    name: "Suya extras",
    options: [
      { name: "Extra yaji pepper", priceDeltaKobo: 20_000, available: true },
      { name: "Onion & tomato salad", priceDeltaKobo: 40_000, available: true },
    ],
  },
  "choose-a-flavour": {
    name: "Choose a flavour",
    options: [
      { name: "Original", priceDeltaKobo: 0, available: true },
      { name: "Spicy", priceDeltaKobo: 0, available: true },
    ],
  },
  "burger-extras": {
    name: "Burger extras",
    options: [
      { name: "Extra cheese slice", priceDeltaKobo: 40_000, available: true },
      { name: "Fried egg", priceDeltaKobo: 30_000, available: true },
      { name: "Extra beef patty", priceDeltaKobo: 120_000, available: true },
      { name: "Extra house sauce", priceDeltaKobo: 20_000, available: true },
      { name: "Crispy chicken strip", priceDeltaKobo: 90_000, available: true },
      { name: "Extra fries", priceDeltaKobo: 70_000, available: true },
    ],
  },
  "choose-a-size": {
    name: "Choose a size",
    options: [
      { name: "Regular (9\")", priceDeltaKobo: 0, available: true },
      { name: "Large (12\")", priceDeltaKobo: 150_000, available: true },
      { name: "Extra large (16\")", priceDeltaKobo: 280_000, available: true },
    ],
  },
  "extra-toppings": {
    name: "Extra toppings",
    options: [
      { name: "Extra mozzarella", priceDeltaKobo: 80_000, available: true },
      { name: "Mushrooms", priceDeltaKobo: 60_000, available: true },
      { name: "Jalapeno", priceDeltaKobo: 40_000, available: true },
      { name: "Grilled chicken", priceDeltaKobo: 120_000, available: true },
    ],
  },
  "sauce": {
    name: "Sauce",
    options: [
      { name: "Garlic mayo", priceDeltaKobo: 0, available: true },
      { name: "Ketchup", priceDeltaKobo: 0, available: true },
      { name: "Chilli sauce", priceDeltaKobo: 0, available: true },
      { name: "All three", priceDeltaKobo: 10_000, available: true },
    ],
  },
  "shawarma-extras": {
    name: "Shawarma extras",
    options: [
      { name: "Extra sausage", priceDeltaKobo: 30_000, available: true },
      { name: "Double meat", priceDeltaKobo: 80_000, available: true },
      { name: "Cheese", priceDeltaKobo: 40_000, available: true },
    ],
  },
  "cake-message": {
    name: "Cake message",
    options: [
      { name: "Add a piped message", priceDeltaKobo: 100_000, available: true },
    ],
  },
  "smoothie-size": {
    name: "Smoothie size",
    options: [
      { name: "Regular (35cl)", priceDeltaKobo: 0, available: true },
      { name: "Large (50cl)", priceDeltaKobo: 40_000, available: true },
    ],
  },
  "bowl-extras": {
    name: "Bowl extras",
    options: [
      { name: "Extra avocado", priceDeltaKobo: 60_000, available: true },
      { name: "Boiled egg", priceDeltaKobo: 30_000, available: true },
      { name: "Extra protein", priceDeltaKobo: 120_000, available: true },
    ],
  },
  "tray-extras": {
    name: "Tray extras",
    options: [
      { name: "Extra puff-puff (12)", priceDeltaKobo: 150_000, available: true },
      { name: "Extra peppered gizzard", priceDeltaKobo: 250_000, available: true },
    ],
  },
};

export type OptionSetId = keyof typeof OPTION_SETS;

/**
 * Build a full `OptionGroup` from a shared set. Option ids are
 * `${overrides.id}:${index}` so they stay stable across menus.
 */
export function optionGroup(
  setId: OptionSetId,
  overrides: { id: string; min: number; max: number; required: boolean },
): OptionGroup {
  const set = OPTION_SETS[setId];
  if (!set) throw new Error(`Unknown option set: ${setId}`);
  return {
    id: overrides.id,
    name: set.name,
    min: overrides.min,
    max: overrides.max,
    required: overrides.required,
    options: set.options.map((option, index) => ({
      id: `${overrides.id}:${index}`,
      ...option,
    })),
  };
}
