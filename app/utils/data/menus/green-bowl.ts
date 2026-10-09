import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Green Bowl menu, transcribed from the demo seed. */
export const greenBowl: MenuSection[] = [
  {
    id: "gb-section-signature-bowls",
    name: "Signature Bowls",
    items: [
      {
        id: "gb-salmon-poke-bowl",
        name: "Salmon Poke Bowl",
        description: "Sushi rice, salmon, edamame, avocado, sesame dressing.",
        priceKobo: 550_000,
        photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "healthy-salads",
        optionGroups: [
          optionGroup("bowl-extras", { id: "gb-salmon-poke-bowl:g1", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "gb-chickpea-avocado-bowl",
        name: "Chickpea & Avocado Bowl",
        description: "Roast chickpeas, avocado, quinoa, tahini.",
        priceKobo: 380_000,
        photoUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "healthy-salads",
        optionGroups: [
          optionGroup("bowl-extras", { id: "gb-chickpea-avocado-bowl:g1", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "gb-caesar-salad",
        name: "Caesar Salad",
        description: "Cos lettuce, parmesan, croutons, anchovy dressing.",
        priceKobo: 320_000,
        photoUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "healthy-salads",
        optionGroups: [],
      },
      {
        id: "gb-grilled-steak-salad",
        name: "Grilled Steak Salad",
        description: "Seared beef, mixed leaves, cashew, chilli dressing.",
        priceKobo: 500_000,
        photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "healthy-salads",
        optionGroups: [],
      },
      {
        id: "gb-beef-meatballs-greens",
        name: "Beef Meatballs & Greens",
        description: "Herbed meatballs over rocket and spinach.",
        priceKobo: 420_000,
        photoUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "healthy-salads",
        optionGroups: [],
      },
    ],
  },
  {
    id: "gb-section-soups",
    name: "Soups",
    items: [
      {
        id: "gb-roast-tomato-soup",
        name: "Roast Tomato Soup",
        description: "Slow-roast tomato, basil, crème fraîche.",
        priceKobo: 240_000,
        photoUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "healthy-salads",
        optionGroups: [],
      },
    ],
  },
];
