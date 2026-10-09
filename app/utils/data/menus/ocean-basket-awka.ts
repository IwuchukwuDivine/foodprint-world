import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Ocean Basket Awka menu, transcribed from the demo seed. */
export const oceanBasketAwka: MenuSection[] = [
  {
    id: "oba-section-from-the-sea",
    name: "From the Sea",
    items: [
      {
        id: "oba-grilled-whole-croaker",
        name: "Grilled Whole Croaker",
        description: "Whole croaker, grilled, with pepper sauce and plantain.",
        priceKobo: 650_000,
        photoUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "seafood",
        optionGroups: [],
      },
      {
        id: "oba-prawn-pepper-soup",
        name: "Prawn Pepper Soup",
        description: "Tiger prawns in a fiery broth with uziza.",
        priceKobo: 550_000,
        photoUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "seafood",
        optionGroups: [],
      },
      {
        id: "oba-seafood-platter-2-people",
        name: "Seafood Platter (2 people)",
        description: "Grilled fish, prawns, calamari, mussels and sides.",
        priceKobo: 1_400_000,
        photoUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "seafood",
        optionGroups: [],
      },
      {
        id: "oba-fisherman-s-soup",
        name: "Fisherman's Soup",
        description: "Catfish, prawns and periwinkle in palm-oil broth.",
        priceKobo: 580_000,
        photoUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&q=80&auto=format&fit=crop",
        available: false,
        category: "seafood",
        optionGroups: [],
      },
    ],
  },
  {
    id: "oba-section-noodles-pasta",
    name: "Noodles & Pasta",
    items: [
      {
        id: "oba-seafood-spaghetti",
        name: "Seafood Spaghetti",
        description: "Mussels, prawns and cherry tomato in white wine.",
        priceKobo: 620_000,
        photoUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "chinese-continental",
        optionGroups: [],
      },
      {
        id: "oba-stir-fried-noodles",
        name: "Stir-Fried Noodles",
        description: "Wok noodles with vegetables and your choice of protein.",
        priceKobo: 400_000,
        photoUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "chinese-continental",
        optionGroups: [
          optionGroup("choose-your-protein", { id: "oba-stir-fried-noodles:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "oba-seafood-salad",
        name: "Seafood Salad",
        description: "Chilled mussels and calamari with olives and herbs.",
        priceKobo: 480_000,
        photoUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "seafood",
        optionGroups: [],
      },
    ],
  },
];
