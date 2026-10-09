import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Fresh Blend Juice Bar menu, transcribed from the demo seed. */
export const freshBlendJuiceBar: MenuSection[] = [
  {
    id: "fbj-section-smoothies",
    name: "Smoothies",
    items: [
      {
        id: "fbj-strawberry-banana-smoothie",
        name: "Strawberry Banana Smoothie",
        description: "Strawberry, banana, yoghurt, honey.",
        priceKobo: 150_000,
        photoUrl: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "drinks-smoothies",
        optionGroups: [
          optionGroup("smoothie-size", { id: "fbj-strawberry-banana-smoothie:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "fbj-green-detox-smoothie",
        name: "Green Detox Smoothie",
        description: "Spinach, kiwi, green apple, cucumber, ginger.",
        priceKobo: 180_000,
        photoUrl: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "drinks-smoothies",
        optionGroups: [
          optionGroup("smoothie-size", { id: "fbj-green-detox-smoothie:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "fbj-tropical-sunrise",
        name: "Tropical Sunrise",
        description: "Mango, pineapple, passionfruit, orange.",
        priceKobo: 170_000,
        photoUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "drinks-smoothies",
        optionGroups: [
          optionGroup("smoothie-size", { id: "fbj-tropical-sunrise:g1", min: 1, max: 1, required: true }),
        ],
      },
    ],
  },
  {
    id: "fbj-section-juices-parfait",
    name: "Juices & Parfait",
    items: [
      {
        id: "fbj-fresh-orange-juice",
        name: "Fresh Orange Juice",
        description: "Squeezed to order. 50cl.",
        priceKobo: 120_000,
        photoUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "drinks-smoothies",
        optionGroups: [],
      },
      {
        id: "fbj-zobo-cooler",
        name: "Zobo Cooler",
        description: "Hibiscus, pineapple and ginger, lightly sweetened.",
        priceKobo: 100_000,
        photoUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "drinks-smoothies",
        optionGroups: [],
      },
      {
        id: "fbj-strawberry-yoghurt-parfait",
        name: "Strawberry Yoghurt Parfait",
        description: "Greek yoghurt layered with granola and berries.",
        priceKobo: 200_000,
        photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "ice-cream-yoghurt",
        optionGroups: [],
      },
    ],
  },
];
