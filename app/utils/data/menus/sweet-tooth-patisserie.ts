import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Sweet Tooth Patisserie menu, transcribed from the demo seed. */
export const sweetToothPatisserie: MenuSection[] = [
  {
    id: "stp-section-cakes",
    name: "Cakes",
    items: [
      {
        id: "stp-chocolate-drip-cake-6",
        name: "Chocolate Drip Cake (6\")",
        description: "Moist chocolate sponge, ganache drip, buttercream rosettes.",
        priceKobo: 1_500_000,
        photoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pastries-cakes",
        optionGroups: [
          optionGroup("cake-message", { id: "stp-chocolate-drip-cake-6:g1", min: 0, max: 1, required: false }),
        ],
      },
      {
        id: "stp-raspberry-layer-cake-slice",
        name: "Raspberry Layer Cake (Slice)",
        description: "Vanilla sponge, raspberry cream, fresh berries.",
        priceKobo: 220_000,
        photoUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pastries-cakes",
        optionGroups: [],
      },
      {
        id: "stp-cupcakes-box-of-6",
        name: "Cupcakes (Box of 6)",
        description: "Assorted buttercream cupcakes with sprinkles.",
        priceKobo: 450_000,
        photoUrl: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pastries-cakes",
        optionGroups: [],
      },
    ],
  },
  {
    id: "stp-section-pastries",
    name: "Pastries",
    items: [
      {
        id: "stp-chocolate-chip-cookies-6",
        name: "Chocolate Chip Cookies (6)",
        description: "Baked twice daily, still soft in the middle.",
        priceKobo: 200_000,
        photoUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pastries-cakes",
        optionGroups: [],
      },
      {
        id: "stp-fruit-tarts-2",
        name: "Fruit Tarts (2)",
        description: "Shortcrust shell, vanilla custard, glazed fruit.",
        priceKobo: 240_000,
        photoUrl: "https://images.unsplash.com/photo-1560180474-e8563fd75bab?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pastries-cakes",
        optionGroups: [],
      },
      {
        id: "stp-crepes-with-strawberries",
        name: "Crêpes with Strawberries",
        description: "Thin crêpes, whipped cream, fresh strawberries.",
        priceKobo: 280_000,
        photoUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pastries-cakes",
        optionGroups: [],
      },
      {
        id: "stp-ice-cream-sundae",
        name: "Ice Cream Sundae",
        description: "Vanilla scoops, caramel sauce, wafer.",
        priceKobo: 180_000,
        photoUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "ice-cream-yoghurt",
        optionGroups: [],
      },
    ],
  },
];
