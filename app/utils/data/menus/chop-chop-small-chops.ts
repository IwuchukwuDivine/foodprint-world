import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Chop Chop Small Chops menu, transcribed from the demo seed. */
export const chopChopSmallChops: MenuSection[] = [
  {
    id: "ccs-section-party-trays",
    name: "Party Trays",
    items: [
      {
        id: "ccs-small-chops-tray-small",
        name: "Small Chops Tray (Small)",
        description: "Puff-puff, samosa, spring roll and gizzard. Serves 5.",
        priceKobo: 800_000,
        photoUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "snacks-small-chops",
        optionGroups: [],
      },
      {
        id: "ccs-small-chops-tray-large",
        name: "Small Chops Tray (Large)",
        description: "The full spread. Serves 15 to 20.",
        priceKobo: 2_200_000,
        photoUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "snacks-small-chops",
        optionGroups: [
          optionGroup("tray-extras", { id: "ccs-small-chops-tray-large:g1", min: 0, max: 2, required: false }),
        ],
      },
      {
        id: "ccs-peppered-gizzard-portion",
        name: "Peppered Gizzard (Portion)",
        description: "Gizzard tossed with bell pepper and onion.",
        priceKobo: 250_000,
        photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "snacks-small-chops",
        optionGroups: [],
      },
      {
        id: "ccs-chicken-wings-tray-20pcs",
        name: "Chicken Wings Tray (20pcs)",
        description: "Barbecue or peppered. Enough for a meeting.",
        priceKobo: 950_000,
        photoUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "snacks-small-chops",
        optionGroups: [],
      },
      {
        id: "ccs-grazing-platter",
        name: "Grazing Platter",
        description: "Fruit, nuts, pastries and dips on one board.",
        priceKobo: 1_800_000,
        photoUrl: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "snacks-small-chops",
        optionGroups: [],
      },
    ],
  },
  {
    id: "ccs-section-sweet-treats",
    name: "Sweet Treats",
    items: [
      {
        id: "ccs-puff-puff-12-pieces",
        name: "Puff-Puff (12 pieces)",
        description: "Golden, airy, dusted with sugar.",
        priceKobo: 150_000,
        photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "snacks-small-chops",
        optionGroups: [],
      },
      {
        id: "ccs-chin-chin-500g",
        name: "Chin Chin (500g)",
        description: "Crunchy fried dough cubes, lightly sweet.",
        priceKobo: 180_000,
        photoUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "snacks-small-chops",
        optionGroups: [],
      },
    ],
  },
];
