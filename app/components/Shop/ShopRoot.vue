<template>
  <div>
    <ShopStorefrontSheet v-if="shop.openSheet === 'storefront'" />
    <ShopItemSheet v-else-if="shop.openSheet === 'item'" />
    <ShopTraySheet v-else-if="shop.openSheet === 'tray'" />
    <ShopCheckoutSheet v-else-if="shop.openSheet === 'checkout'" />
    <ShopPaymentModal v-else-if="shop.openSheet === 'payment'" />
    <ShopHandoffSheet v-else-if="shop.openSheet === 'handoff'" />
    <ShopRatingSheet v-else-if="shop.openSheet === 'rating'" />
    <ShopOrderHistorySheet v-else-if="shop.openSheet === 'history'" />
    <ShopOrderDetailSheet v-else-if="shop.openSheet === 'detail'" />

    <ShopTrayConflictModal
      :model-value="pendingAddition !== null"
      :current-kitchen-name="tray.kitchenName"
      @update:model-value="onConflictToggle"
      @replace="replaceTray"
    />
  </div>
</template>

<script setup lang="ts">
import { useShopStore } from "~/stores/shop";
import { useTrayStore, type TrayAddition } from "~/stores/tray";
import { REQUEST_ADD_KEY } from "~/utils/shopKeys";

/**
 * Exactly one sheet is mounted at a time, picked by `shop.openSheet`. The
 * "add to tray" path lives here so the one-kitchen-per-tray question is asked
 * in one place, whichever sheet started it.
 */
const shop = useShopStore();
const tray = useTrayStore();
const toast = useToast();

/** The addition waiting on the conflict modal's answer. */
const pendingAddition = ref<TrayAddition | null>(null);

function commit(addition: TrayAddition) {
  toast.success("Added to your tray");
  shop.openStorefront(addition.kitchenSlug);
}

function requestAdd(addition: TrayAddition) {
  if (tray.conflictsWith(addition.kitchenSlug)) {
    pendingAddition.value = addition;
    return;
  }
  tray.add(addition);
  commit(addition);
}

function replaceTray() {
  const addition = pendingAddition.value;
  pendingAddition.value = null;
  if (!addition) return;
  tray.replaceWith(addition);
  commit(addition);
}

function onConflictToggle(open: boolean) {
  if (!open) pendingAddition.value = null;
}

provide(REQUEST_ADD_KEY, requestAdd);
</script>
