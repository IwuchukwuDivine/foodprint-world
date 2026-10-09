<template>
  <div v-if="mounted && (showTray || showHistory)" class="hud-tray">
    <AppButton v-if="showTray" variant="primary" icon="bag" class="hud-pointer hud-tray__pill" @click="shop.open('tray')">
      <span class="inline-flex items-center gap-2">
        <span>Tray · {{ tray.count }}</span>
        <AppPrice :kobo="tray.subtotalKobo" tone="inverse" size="sm" />
      </span>
    </AppButton>
    <button
      v-if="showHistory"
      type="button"
      class="hud-pointer hud-tray__history glass-bar glass-bar--on"
      aria-label="Your orders"
      title="Your orders"
      @click="shop.open('history')"
    >
      <Icon name="receipt" :size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useOrderStore } from "~/stores/order";
import { useShopStore } from "~/stores/shop";
import { useTrayStore } from "~/stores/tray";

/* The tray and history live in localStorage: nothing renders until mounted so
   the server and the client agree on the first paint. */
const mounted = useMounted();
const shop = useShopStore();
const tray = useTrayStore();
const order = useOrderStore();

const noSheet = computed(() => shop.openSheet === null);
const showTray = computed(() => noSheet.value && tray.count > 0);
const showHistory = computed(() => noSheet.value && (order.history.length > 0 || order.activeOrder !== null));
</script>

<style scoped>
.hud-tray {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(24px + var(--bottom));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  pointer-events: none;
}
.hud-tray__pill {
  box-shadow: var(--shadow-float);
}
.hud-tray__history {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  color: var(--color-ink);
  cursor: pointer;
  transition: transform 0.2s var(--ease-spring);
}
.hud-tray__history:hover {
  transform: translateY(-1px);
}
</style>
