import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Shawarma King Aroma menu, transcribed from the demo seed. */
export const shawarmaKingAroma: MenuSection[] = [
  {
    id: "ska-section-shawarma",
    name: "Shawarma",
    items: [
      {
        id: "ska-chicken-shawarma",
        name: "Chicken Shawarma",
        description: "Shredded chicken, cabbage, garlic mayo, ketchup, in warm pita.",
        priceKobo: 200_000,
        photoUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "shawarma-wraps",
        optionGroups: [
          optionGroup("sauce", { id: "ska-chicken-shawarma:g1", min: 1, max: 1, required: true }),
          optionGroup("shawarma-extras", { id: "ska-chicken-shawarma:g2", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "ska-beef-shawarma",
        name: "Beef Shawarma",
        description: "Marinated beef off the spit with pickles and chilli sauce.",
        priceKobo: 230_000,
        photoUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "shawarma-wraps",
        optionGroups: [
          optionGroup("sauce", { id: "ska-beef-shawarma:g1", min: 1, max: 1, required: true }),
          optionGroup("shawarma-extras", { id: "ska-beef-shawarma:g2", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "ska-double-sausage-shawarma",
        name: "Double Sausage Shawarma",
        description: "Chicken and beef, two sausages, extra garlic sauce.",
        priceKobo: 300_000,
        photoUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "shawarma-wraps",
        optionGroups: [],
      },
      {
        id: "ska-chicken-chips-wrap",
        name: "Chicken & Chips Wrap",
        description: "Crispy chicken and fries rolled in a soft tortilla.",
        priceKobo: 260_000,
        photoUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "shawarma-wraps",
        optionGroups: [],
      },
    ],
  },
  {
    id: "ska-section-combos",
    name: "Combos",
    items: [
      {
        id: "ska-shawarma-drink-combo",
        name: "Shawarma + Drink Combo",
        description: "Any shawarma with a chilled 50cl soft drink.",
        priceKobo: 250_000,
        photoUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "shawarma-wraps",
        optionGroups: [],
      },
      {
        id: "ska-family-pack-4-wraps",
        name: "Family Pack (4 Wraps)",
        description: "Four shawarma wraps, mix and match.",
        priceKobo: 760_000,
        photoUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "shawarma-wraps",
        optionGroups: [],
      },
    ],
  },
];
