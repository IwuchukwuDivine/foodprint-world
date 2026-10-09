import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Napoli Pizza & Pasta menu, transcribed from the demo seed. */
export const napoliPizzaPasta: MenuSection[] = [
  {
    id: "npp-section-stone-baked-pizza",
    name: "Stone-Baked Pizza",
    items: [
      {
        id: "npp-margherita",
        name: "Margherita",
        description: "San Marzano tomato, fior di latte, basil.",
        priceKobo: 550_000,
        photoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pizza",
        optionGroups: [
          optionGroup("choose-a-size", { id: "npp-margherita:g1", min: 1, max: 1, required: true }),
          optionGroup("extra-toppings", { id: "npp-margherita:g2", min: 0, max: 4, required: false }),
        ],
      },
      {
        id: "npp-pepperoni",
        name: "Pepperoni",
        description: "Double pepperoni, mozzarella, oregano.",
        priceKobo: 650_000,
        photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pizza",
        optionGroups: [
          optionGroup("choose-a-size", { id: "npp-pepperoni:g1", min: 1, max: 1, required: true }),
          optionGroup("extra-toppings", { id: "npp-pepperoni:g2", min: 0, max: 4, required: false }),
        ],
      },
      {
        id: "npp-bbq-chicken-pizza",
        name: "BBQ Chicken Pizza",
        description: "Grilled chicken, red onion, BBQ base, mozzarella.",
        priceKobo: 700_000,
        photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pizza",
        optionGroups: [
          optionGroup("choose-a-size", { id: "npp-bbq-chicken-pizza:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "npp-four-cheese",
        name: "Four Cheese",
        description: "Mozzarella, gorgonzola, parmesan, provolone.",
        priceKobo: 720_000,
        photoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&q=80&auto=format&fit=crop",
        available: false,
        category: "pizza",
        optionGroups: [],
      },
    ],
  },
  {
    id: "npp-section-pasta",
    name: "Pasta",
    items: [
      {
        id: "npp-penne-bolognese",
        name: "Penne Bolognese",
        description: "Slow-cooked beef ragù, parmesan, fresh basil.",
        priceKobo: 450_000,
        photoUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "chinese-continental",
        optionGroups: [],
      },
      {
        id: "npp-seafood-spaghetti",
        name: "Seafood Spaghetti",
        description: "Prawns, mussels and calamari in a light tomato sauce.",
        priceKobo: 680_000,
        photoUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "seafood",
        optionGroups: [],
      },
      {
        id: "npp-tiramisu",
        name: "Tiramisu",
        description: "Espresso-soaked savoiardi, mascarpone, cocoa.",
        priceKobo: 250_000,
        photoUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "pastries-cakes",
        optionGroups: [],
      },
    ],
  },
];
