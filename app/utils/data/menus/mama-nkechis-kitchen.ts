import type { MenuSection } from "~/utils/types/shop";
import { optionGroup } from "~/utils/data/optionSets";

/** Mama Nkechi's Kitchen menu, transcribed from the demo seed. */
export const mamaNkechisKitchen: MenuSection[] = [
  {
    id: "mnk-section-soups-swallow",
    name: "Soups & Swallow",
    items: [
      {
        id: "mnk-egusi-soup-pounded-yam",
        name: "Egusi Soup & Pounded Yam",
        description: "Melon seed soup with goat meat, stockfish and bitterleaf. Served with fresh pounded yam.",
        priceKobo: 350_000,
        photoUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "swallow-soup",
        optionGroups: [
          optionGroup("choose-your-swallow", { id: "mnk-egusi-soup-pounded-yam:g1", min: 1, max: 1, required: true }),
          optionGroup("extra-protein", { id: "mnk-egusi-soup-pounded-yam:g2", min: 0, max: 3, required: false }),
          optionGroup("extra-swallow", { id: "mnk-egusi-soup-pounded-yam:g3", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "mnk-oha-soup-semo",
        name: "Oha Soup & Semo",
        description: "Oha leaves in a rich cocoyam-thickened base with assorted meat.",
        priceKobo: 320_000,
        photoUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "swallow-soup",
        optionGroups: [
          optionGroup("choose-your-swallow", { id: "mnk-oha-soup-semo:g1", min: 1, max: 1, required: true }),
          optionGroup("extra-swallow", { id: "mnk-oha-soup-semo:g2", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "mnk-nsala-white-soup-fufu",
        name: "Nsala (White Soup) & Fufu",
        description: "Peppery catfish white soup, no palm oil. The Anambra classic.",
        priceKobo: 400_000,
        photoUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "swallow-soup",
        optionGroups: [
          optionGroup("choose-your-swallow", { id: "mnk-nsala-white-soup-fufu:g1", min: 1, max: 1, required: true }),
          optionGroup("extra-swallow", { id: "mnk-nsala-white-soup-fufu:g2", min: 0, max: 3, required: false }),
        ],
      },
      {
        id: "mnk-bitterleaf-soup-eba",
        name: "Bitterleaf Soup & Eba",
        description: "Ofe onugbu simmered slow with cocoyam and dried fish.",
        priceKobo: 300_000,
        photoUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&h=600&q=80&auto=format&fit=crop",
        available: false,
        category: "swallow-soup",
        optionGroups: [],
      },
    ],
  },
  {
    id: "mnk-section-rice-sides",
    name: "Rice & Sides",
    items: [
      {
        id: "mnk-native-jollof-rice",
        name: "Native Jollof Rice",
        description: "Palm-oil jollof cooked with dried fish, ugba and scent leaf.",
        priceKobo: 250_000,
        photoUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "jollof-rice",
        optionGroups: [],
      },
      {
        id: "mnk-ofe-akwu-white-rice",
        name: "Ofe Akwu & White Rice",
        description: "Palm nut stew with prawns and beef over steamed white rice.",
        priceKobo: 280_000,
        photoUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "native-delicacies",
        optionGroups: [],
      },
    ],
  },
  {
    id: "mnk-section-proteins",
    name: "Proteins",
    items: [
      {
        id: "mnk-nkwobi",
        name: "Nkwobi",
        description: "Cow foot in spicy palm oil emulsion, served in the traditional wooden bowl.",
        priceKobo: 280_000,
        photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "native-delicacies",
        optionGroups: [],
      },
      {
        id: "mnk-isi-ewu",
        name: "Isi Ewu",
        description: "Goat head delicacy, generously spiced. Enough for two.",
        priceKobo: 650_000,
        photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&q=80&auto=format&fit=crop",
        available: true,
        category: "native-delicacies",
        optionGroups: [],
      },
    ],
  },
];
