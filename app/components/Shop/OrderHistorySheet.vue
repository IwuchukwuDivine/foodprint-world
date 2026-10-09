<template>
  <AppBottomSlider :model-value="true" title="Your orders" role="customer" @update:model-value="shop.close()">
    <div v-if="orders.length" class="flex flex-col gap-2.5">
      <button
        v-for="entry in orders"
        :key="entry.code"
        type="button"
        class="history-row"
        @click="openDetail(entry.code)"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <AppBadge :tone="ORDER_STATUS_META[entry.status].tone" :label="ORDER_STATUS_META[entry.status].label" dot />
            <span class="text-[12.5px] text-ink-muted">{{ formatShortDate(entry.createdAt) }}</span>
          </div>
          <p class="m-0 mt-1.5 truncate text-[15px] font-semibold text-ink">{{ entry.kitchenName }}</p>
          <p class="m-0 mt-0.5 truncate text-[13px] text-ink-muted">{{ summaryOf(entry) }}</p>
        </div>
        <div class="flex flex-none flex-col items-end gap-1">
          <AppPrice :kobo="entry.totalKobo" size="sm" />
          <Icon name="chevron-right" :size="16" class="text-ink-faint" />
        </div>
      </button>
    </div>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="receipt" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">No orders yet</p>
      <p class="m-0 text-sm text-ink-muted">Your first order will show up here.</p>
      <AppButton variant="secondary" size="sm" class="mt-3" @click="shop.close()">Back to the street</AppButton>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useOrderStore, type WorldOrder } from "~/stores/order";
import { useShopStore } from "~/stores/shop";
import { ORDER_STATUS_META } from "~/utils/constants/orderStatus";
import formatShortDate from "~/utils/formatShortDate";

const shop = useShopStore();
const order = useOrderStore();

/* A live order is not in history until it ends, so it leads the list. */
const orders = computed<WorldOrder[]>(() => {
  const active = order.activeOrder;
  const past = order.history.filter((entry) => entry.code !== active?.code);
  return active ? [active, ...past] : past;
});

const summaryOf = (entry: WorldOrder) =>
  entry.lines.map((line) => `${line.quantity}x ${line.name}`).join(", ");

function openDetail(code: string) {
  shop.detailCode = code;
  shop.open("detail");
}
</script>

<style scoped>
.history-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 16px;
  border: 1.5px solid var(--color-line-soft);
  background: var(--color-surface);
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s var(--ease-spring);
}
.history-row:hover {
  border-color: var(--color-primary);
}
.history-row:active {
  transform: scale(0.99);
}
</style>
