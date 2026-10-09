<template>
  <section v-if="mounted && active" class="hud-order glass-bar glass-bar--on hud-pointer" aria-live="polite">
    <button type="button" class="hud-order__head" :aria-expanded="expanded" @click="expanded = !expanded">
      <AppBadge :tone="meta.tone" :label="meta.label" dot />
      <span class="hud-order__kitchen">{{ active.kitchenName }}</span>
      <span class="hud-order__code">{{ active.code }}</span>
      <Icon :name="expanded ? 'chevron-down' : 'chevron-up'" :size="16" class="text-ink-muted" />
    </button>

    <div v-if="expanded" class="hud-order__body">
      <div v-if="isOffTimeline" class="shop-notice">
        <Icon name="info" :size="16" />
        <span>{{ hint }}</span>
      </div>
      <template v-else>
        <AppOrderTracker :stages="stages" :current="current" vertical class="hud-order__tracker" />
        <p class="hud-order__hint">{{ hint }}</p>
      </template>

      <div class="hud-order__actions">
        <AppChip
          v-if="canFollow"
          :model-value="world.followingRider"
          icon="rider"
          label="Follow rider"
          @update:model-value="setFollow"
        />
        <AppButton v-if="active.riderPhase === 'waiting'" variant="primary" size="sm" icon="home" @click="walkHome">
          Walk home
        </AppButton>
        <template v-if="isTerminal">
          <AppButton
            v-if="active.status === 'delivered' && !active.rating"
            variant="primary"
            size="sm"
            icon="star"
            @click="shop.open('rating')"
          >
            Rate your order
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="order.dismiss()">Done</AppButton>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useOrderStore } from "~/stores/order";
import { useShopStore } from "~/stores/shop";
import { useWorldStore } from "~/stores/world";
import type { TrackerStage } from "~/utils/types/ui";
import {
  ORDER_STATUS_HINT,
  ORDER_STATUS_META,
  TRACKER_STAGES,
  isTerminalOrderStatus,
  trackerIndexFor,
} from "~/utils/constants/orderStatus";
import formatClock from "~/utils/formatClock";
import homeDoorTile from "~/utils/homeDoorTile";

const mounted = useMounted();
const order = useOrderStore();
const shop = useShopStore();
const world = useWorldStore();
const api = useWorldApi();

const active = computed(() => order.activeOrder);
const meta = computed(() => ORDER_STATUS_META[active.value?.status ?? "paid"]);
const isTerminal = computed(() => !!active.value && isTerminalOrderStatus(active.value.status));
const isOffTimeline = computed(() => active.value?.status === "cancelled" || active.value?.status === "refunded");

const stages = computed<TrackerStage[]>(() =>
  TRACKER_STAGES.map((stage) => {
    const at = active.value?.statusAt[stage.status];
    return { label: stage.label, time: at ? formatClock(at) : undefined };
  }),
);
const current = computed(() => (active.value ? trackerIndexFor(active.value.status) : 0));

const hint = computed(() => {
  if (!active.value) return "";
  if (active.value.riderPhase === "waiting") {
    return world.playerNearHome ? "Your rider is at your door" : "Head home to meet your rider";
  }
  return ORDER_STATUS_HINT[active.value.status];
});

const canFollow = computed(
  () => active.value?.riderPhase === "to_kitchen" || active.value?.riderPhase === "to_home",
);

/* Open by default where there is room (the desktop column), collapsed on a
   phone so the world stays visible. Moments that need the player (a rider at
   the door, food delivered, an order cancelled) pop it open on every width. */
const expanded = ref(false);
onMounted(() => {
  expanded.value = window.matchMedia("(min-width: 1024px)").matches;
});
watch(
  () => [active.value?.status, active.value?.riderPhase],
  () => {
    if (!active.value) return;
    if (active.value.riderPhase === "waiting" || isTerminalOrderStatus(active.value.status)) {
      expanded.value = true;
    }
  },
);

function setFollow(follow: boolean) {
  api.value?.setFollowRider(follow);
}

function walkHome() {
  api.value?.walkTo(homeDoorTile());
}
</script>

<style scoped>
.hud-order {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(88px + var(--bottom));
  border-radius: 20px;
  overflow: hidden;
  color: var(--color-ink);
}
.hud-order__head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px 10px 10px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.hud-order__kitchen {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}
.hud-order__code {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-ink-muted);
  font-variant-numeric: tabular-nums;
}
.hud-order__body {
  padding: 0 12px 12px;
  max-height: calc(100dvh - 220px - var(--top) - var(--bottom));
  overflow-y: auto;
}
.hud-order__tracker {
  padding: 0 2px;
}
.hud-order__hint {
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--color-ink-soft);
}
.hud-order__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
.hud-order__actions:empty {
  display: none;
}
@media (min-width: 1024px) {
  .hud-order {
    left: auto;
    right: 12px;
    bottom: auto;
    top: calc(184px + var(--top));
    width: 340px;
  }
  .hud-order__body {
    max-height: calc(100dvh - 260px - var(--top));
  }
}
</style>
