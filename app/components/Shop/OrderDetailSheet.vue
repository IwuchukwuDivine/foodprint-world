<template>
  <AppBottomSlider :model-value="true" :title="entry ? `Order ${entry.code}` : 'Order'" role="customer" @update:model-value="shop.close()">
    <template v-if="entry">
      <AppButton variant="ghost" size="sm" icon="chevron-left" class="-ml-3 mb-2" @click="shop.open('history')">
        Your orders
      </AppButton>

      <div class="flex flex-wrap items-center gap-2">
        <AppBadge :tone="meta.tone" :label="meta.label" dot />
        <span class="text-[13px] text-ink-muted">{{ entry.kitchenName }} · {{ formatShortDate(entry.createdAt) }}</span>
      </div>

      <div v-if="isOffTimeline" class="shop-notice mt-4">
        <Icon name="info" :size="16" />
        <span>{{ ORDER_STATUS_HINT[entry.status] }}</span>
      </div>
      <AppOrderTracker v-else class="mt-5" :stages="stages" :current="current" vertical />

      <div v-if="!isTerminal" class="mt-5 flex justify-center">
        <AppOtpDisplay :code="entry.otp" variant="plain" caption="Read it to your rider at the door" />
      </div>

      <h4 class="m-0 mb-2 mt-6 text-[15px] font-semibold text-ink">Items</h4>
      <ul class="m-0 list-none p-0">
        <li v-for="(line, index) in entry.lines" :key="index" class="flex justify-between gap-3 py-1.5 text-[14px]">
          <div class="min-w-0">
            <p class="m-0 truncate text-ink">{{ line.quantity }}x {{ line.name }}</p>
            <p v-if="line.options.length" class="m-0 truncate text-[12.5px] text-ink-muted">
              {{ line.options.map((option) => option.name).join(", ") }}
            </p>
          </div>
          <AppPrice :kobo="line.lineTotalKobo" size="sm" />
        </li>
      </ul>

      <AppFeeSummary
        class="mt-3"
        bare
        :subtotal-kobo="entry.subtotalKobo"
        :delivery-fee-kobo="entry.deliveryFeeKobo"
        :service-fee-kobo="entry.serviceFeeKobo"
        :total-kobo="entry.totalKobo"
      />

      <div v-if="entry.rating" class="mt-4 flex items-center gap-3 text-[13px] text-ink-muted">
        <span class="inline-flex items-center gap-1">Kitchen <AppRating :model-value="entry.rating.kitchen" readonly :size="14" /></span>
        <span class="inline-flex items-center gap-1">Rider <AppRating :model-value="entry.rating.rider" readonly :size="14" /></span>
      </div>

      <div class="shop-sticky-footer">
        <AppButton variant="primary" size="lg" block icon="refresh" @click="reorder">Reorder</AppButton>
      </div>
    </template>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="receipt" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">Order not found</p>
      <AppButton variant="secondary" size="sm" class="mt-2" @click="shop.open('history')">Your orders</AppButton>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useOrderStore, type WorldOrder } from "~/stores/order";
import { useShopStore } from "~/stores/shop";
import { useTrayStore, type TrayAddition } from "~/stores/tray";
import type { OrderLine } from "~/utils/types/order";
import type { TrackerStage } from "~/utils/types/ui";
import {
  ORDER_STATUS_HINT,
  ORDER_STATUS_META,
  TRACKER_STAGES,
  isTerminalOrderStatus,
  trackerIndexFor,
} from "~/utils/constants/orderStatus";
import { menuFor } from "~/utils/data/menus";
import formatClock from "~/utils/formatClock";
import formatShortDate from "~/utils/formatShortDate";

const shop = useShopStore();
const order = useOrderStore();
const tray = useTrayStore();
const toast = useToast();

const entry = computed<WorldOrder | null>(() => {
  const code = shop.detailCode;
  if (!code) return null;
  if (order.activeOrder?.code === code) return order.activeOrder;
  return order.history.find((candidate) => candidate.code === code) ?? null;
});

const meta = computed(() => ORDER_STATUS_META[entry.value?.status ?? "paid"]);
const isTerminal = computed(() => !!entry.value && isTerminalOrderStatus(entry.value.status));
/* Cancelled and refunded orders have left the timeline; a frozen tracker would lie. */
const isOffTimeline = computed(() => entry.value?.status === "cancelled" || entry.value?.status === "refunded");

const stages = computed<TrackerStage[]>(() =>
  TRACKER_STAGES.map((stage) => {
    const at = entry.value?.statusAt[stage.status];
    return { label: stage.label, time: at ? formatClock(at) : undefined };
  }),
);
const current = computed(() => (entry.value ? trackerIndexFor(entry.value.status) : 0));

/**
 * Order lines are frozen receipts without item ids, so a reorder looks the
 * dish up by name in the kitchen's menu for its id and photo, and falls back
 * to a name-derived id. Options are frozen too: they get name ids under a
 * single "reorder" group, which is enough for the tray to price them.
 */
function additionFor(line: OrderLine, source: WorldOrder): TrayAddition {
  const menuItem = menuFor(source.kitchenSlug)
    .flatMap((section) => section.items)
    .find((item) => item.name === line.name);
  return {
    kitchenSlug: source.kitchenSlug,
    kitchenName: source.kitchenName,
    itemId: menuItem?.id ?? `reorder:${line.name}`,
    name: line.name,
    photoUrl: menuItem?.photoUrl ?? null,
    unitPriceKobo: line.unitPriceKobo,
    quantity: line.quantity,
    options: line.options.map((option) => ({
      id: option.name,
      groupId: "reorder",
      name: option.name,
      priceDeltaKobo: option.priceDeltaKobo,
      quantity: 1,
    })),
  };
}

function reorder() {
  const source = entry.value;
  if (!source || source.lines.length === 0) return;
  source.lines.forEach((line, index) => {
    const addition = additionFor(line, source);
    if (index === 0) tray.replaceWith(addition);
    else tray.add(addition);
  });
  toast.success("Tray refilled from your order");
  shop.open("tray");
}
</script>
