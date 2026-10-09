import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Crispy Crown Chicken menu, transcribed from the demo seed. */
export const crispyCrownChicken: MenuSection[] = [
  {
    id: "ccc-section-fried-chicken",
    name: "Fried Chicken",
    items: [
      {
        id: "ccc-2-piece-chicken-chips",
        name: "2-Piece Chicken & Chips",
        description: "Two pieces of buttermilk fried chicken with a side of chips.",
        priceKobo: 320_000,
        photoUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "fast-food-burgers",
        optionGroups: [
          optionGroup("choose-a-flavour", { id: "ccc-2-piece-chicken-chips:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "ccc-6-piece-bucket",
        name: "6-Piece Bucket",
        description: "Six pieces to share. Original or spicy.",
        priceKobo: 750_000,
        photoUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "fast-food-burgers",
        optionGroups: [
          optionGroup("choose-a-flavour", { id: "ccc-6-piece-bucket:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "ccc-buffalo-wings-8pcs",
        name: "Buffalo Wings (8pcs)",
        description: "Tossed in buffalo sauce, served with ranch dip.",
        priceKobo: 400_000,
        photoUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "grills-suya",
        optionGroups: [],
      },
    ],
  },
  {
    id: "ccc-section-burgers",
    name: "Burgers",
    items: [
      {
        id: "ccc-crown-classic-burger",
        name: "Crown Classic Burger",
        description: "Beef patty, cheddar, lettuce, tomato, house sauce.",
        priceKobo: 350_000,
        photoUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "fast-food-burgers",
        optionGroups: [
          optionGroup("burger-extras", { id: "ccc-crown-classic-burger:g1", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "ccc-double-cheese-burger",
        name: "Double Cheese Burger",
        description: "Two patties, double cheddar, pickles. Not a light lunch.",
        priceKobo: 480_000,
        photoUrl: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "fast-food-burgers",
        optionGroups: [
          optionGroup("burger-extras", { id: "ccc-double-cheese-burger:g1", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "ccc-chicken-burger-fries",
        name: "Chicken Burger & Fries",
        description: "Crispy chicken fillet, coleslaw, brioche bun, side of fries.",
        priceKobo: 420_000,
        photoUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "fast-food-burgers",
        optionGroups: [],
      },
    ],
  },
  {
    id: "ccc-section-sides-drinks",
    name: "Sides & Drinks",
    items: [
      {
        id: "ccc-loaded-fries",
        name: "Loaded Fries",
        description: "Fries under melted cheese, jalapeño and beef mince.",
        priceKobo: 220_000,
        photoUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "others",
        optionGroups: [],
      },
      {
        id: "ccc-chilled-soft-drink",
        name: "Chilled Soft Drink",
        description: "Coke, Fanta or Sprite. 50cl.",
        priceKobo: 50_000,
        photoUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "drinks-smoothies",
        optionGroups: [],
      },
    ],
  },
];
