import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Suya Spot Ifite menu, transcribed from the demo seed. */
export const suyaSpotIfite: MenuSection[] = [
  {
    id: "ssi-section-from-the-grill",
    name: "From the Grill",
    items: [
      {
        id: "ssi-beef-suya",
        name: "Beef Suya",
        description: "Thin-sliced beef on skewers, charcoal-grilled, heavy on the yaji.",
        priceKobo: 200_000,
        photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "grills-suya",
        optionGroups: [
          optionGroup("spice-level", { id: "ssi-beef-suya:g1", min: 1, max: 1, required: true }),
          optionGroup("suya-extras", { id: "ssi-beef-suya:g2", min: 0, max: 2, required: false }),
        ],
      },
      {
        id: "ssi-chicken-suya",
        name: "Chicken Suya",
        description: "Whole chicken quarters, spiced and grilled over coals.",
        priceKobo: 250_000,
        photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "grills-suya",
        optionGroups: [
          optionGroup("spice-level", { id: "ssi-chicken-suya:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "ssi-ram-suya",
        name: "Ram Suya",
        description: "Richer, fattier, grilled to order. Weekend favourite.",
        priceKobo: 350_000,
        photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "grills-suya",
        optionGroups: [
          optionGroup("spice-level", { id: "ssi-ram-suya:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "ssi-asun-peppered-goat",
        name: "Asun (Peppered Goat)",
        description: "Smoked goat meat tossed with scotch bonnet and onion.",
        priceKobo: 320_000,
        photoUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "grills-suya",
        optionGroups: [],
      },
      {
        id: "ssi-grilled-fish-whole-tilapia",
        name: "Grilled Fish (Whole Tilapia)",
        description: "Whole tilapia, scored and grilled, served with pepper sauce.",
        priceKobo: 450_000,
        photoUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "seafood",
        optionGroups: [],
      },
    ],
  },
  {
    id: "ssi-section-extras",
    name: "Extras",
    items: [
      {
        id: "ssi-yaji-pepper-extra",
        name: "Yaji Pepper (Extra)",
        description: "A sachet of our house suya spice.",
        priceKobo: 20_000,
        photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "others",
        optionGroups: [],
      },
      {
        id: "ssi-onion-tomato-salad",
        name: "Onion & Tomato Salad",
        description: "Sliced raw onion, tomato and cabbage.",
        priceKobo: 40_000,
        photoUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "others",
        optionGroups: [],
      },
    ],
  },
];
