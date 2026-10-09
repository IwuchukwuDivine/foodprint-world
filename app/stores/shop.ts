import { defineStore } from "pinia";

export type ShopSheet =
  | "storefront"
  | "item"
  | "tray"
  | "checkout"
  | "payment"
  | "handoff"
  | "rating"
  | "history"
  | "detail";

/** Which sheet is open and what it is looking at. Not persisted. */
export const useShopStore = defineStore("shop", () => {
  const openSheet = ref<ShopSheet | null>(null);
  const activeKitchenSlug = ref<string | null>(null);
  const activeItemId = ref<string | null>(null);
  const detailCode = ref<string | null>(null);

  function open(sheet: ShopSheet) {
    openSheet.value = sheet;
  }

  function close() {
    openSheet.value = null;
  }

  function openStorefront(slug: string) {
    activeKitchenSlug.value = slug;
    openSheet.value = "storefront";
  }

  function openItem(itemId: string) {
    activeItemId.value = itemId;
    openSheet.value = "item";
  }

  return { openSheet, activeKitchenSlug, activeItemId, detailCode, open, close, openStorefront, openItem };
});
