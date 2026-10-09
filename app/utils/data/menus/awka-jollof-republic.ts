import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Awka Jollof Republic menu, transcribed from the demo seed. */
export const awkaJollofRepublic: MenuSection[] = [
  {
    id: "ajr-section-signature-rice",
    name: "Signature Rice",
    items: [
      {
        id: "ajr-party-jollof-rice",
        name: "Party Jollof Rice",
        description: "The smoky one. Long-grain rice, firewood finish, one piece of chicken.",
        priceKobo: 250_000,
        photoUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "jollof-rice",
        optionGroups: [
          optionGroup("choose-your-protein", { id: "ajr-party-jollof-rice:g1", min: 1, max: 1, required: true }),
          optionGroup("add-extras", { id: "ajr-party-jollof-rice:g2", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "ajr-fried-rice",
        name: "Fried Rice",
        description: "Vegetable fried rice with liver, green beans and sweetcorn.",
        priceKobo: 260_000,
        photoUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "jollof-rice",
        optionGroups: [
          optionGroup("choose-your-protein", { id: "ajr-fried-rice:g1", min: 1, max: 1, required: true }),
        ],
      },
      {
        id: "ajr-coconut-rice",
        name: "Coconut Rice",
        description: "Rice steamed in coconut milk with prawns and peppers.",
        priceKobo: 300_000,
        photoUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "jollof-rice",
        optionGroups: [],
      },
      {
        id: "ajr-jollof-fried-rice-combo",
        name: "Jollof & Fried Rice Combo",
        description: "Half party jollof, half fried rice, one chicken, one plantain.",
        priceKobo: 380_000,
        photoUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "jollof-rice",
        optionGroups: [
          optionGroup("choose-your-protein", { id: "ajr-jollof-fried-rice-combo:g1", min: 1, max: 1, required: true }),
          optionGroup("add-extras", { id: "ajr-jollof-fried-rice-combo:g2", min: 0, max: 3, required: false }),
        ],
      },
    ],
  },
  {
    id: "ajr-section-sides",
    name: "Sides",
    items: [
      {
        id: "ajr-dodo-fried-plantain",
        name: "Dodo (Fried Plantain)",
        description: "Ripe plantain, fried soft and sweet.",
        priceKobo: 70_000,
        photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "others",
        optionGroups: [],
      },
      {
        id: "ajr-moi-moi",
        name: "Moi Moi",
        description: "Steamed bean pudding with egg and fish.",
        priceKobo: 80_000,
        photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "others",
        optionGroups: [],
      },
      {
        id: "ajr-coleslaw",
        name: "Coleslaw",
        description: "Crunchy cabbage and carrot in creamy dressing.",
        priceKobo: 60_000,
        photoUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "healthy-salads",
        optionGroups: [],
      },
    ],
  },
];
