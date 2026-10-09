<template>
  <div class="hud-ticker">
    <div class="glass-bar glass-bar--on hud-ticker__pill" :class="{ 'hud-ticker__pill--live': isLive }" aria-live="polite">
      <Icon name="bell" :size="14" class="hud-ticker__bell" />
      <div ref="trackEl" class="hud-ticker__track">
        <Transition :name="reduceMotion ? 'none' : 'ticker'">
          <span :key="lineKey" ref="textEl" class="hud-ticker__text" :class="{ 'hud-ticker__text--scroll': overflow > 0 }" :style="{ '--shift': `-${overflow}px` }">
            {{ line }}
          </span>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderStore } from "~/stores/order";
import { TICKER_INTERVAL_MS, TICKER_LINES } from "~/utils/constants/ticker";
import orderTickerLine from "~/utils/orderTickerLine";

/**
 * One line of city news under the top bar. Ambient lines rotate; a status
 * change on the live order jumps the queue and holds for one interval.
 */
const order = useOrderStore();

const index = ref(0);
const liveLine = ref<string | null>(null);
const tick = ref(0);
const reduceMotion = ref(false);

const isLive = computed(() => liveLine.value !== null);
const line = computed(() => liveLine.value ?? TICKER_LINES[index.value % TICKER_LINES.length] ?? "");
const lineKey = computed(() => `${tick.value}:${line.value}`);

const trackEl = ref<HTMLElement | null>(null);
const textEl = ref<HTMLElement | null>(null);
const overflow = ref(0);

let timer: ReturnType<typeof setInterval> | null = null;

function advance() {
  if (liveLine.value !== null) {
    liveLine.value = null;
  } else {
    index.value = (index.value + 1) % TICKER_LINES.length;
  }
  tick.value += 1;
}

function restart() {
  if (timer) clearInterval(timer);
  timer = setInterval(advance, TICKER_INTERVAL_MS);
}

function measure() {
  const track = trackEl.value;
  const text = textEl.value;
  if (!track || !text || reduceMotion.value) {
    overflow.value = 0;
    return;
  }
  overflow.value = Math.max(0, text.scrollWidth - track.clientWidth);
}

watch(
  () => order.activeOrder?.status,
  (status, previous) => {
    if (!status || status === previous || !order.activeOrder) return;
    liveLine.value = orderTickerLine(order.activeOrder);
    tick.value += 1;
    restart();
  },
);

watch(lineKey, () => nextTick(measure));

onMounted(() => {
  reduceMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  index.value = Math.floor(Math.random() * TICKER_LINES.length);
  restart();
  nextTick(measure);
  window.addEventListener("resize", measure);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener("resize", measure);
});
</script>

<style scoped>
.hud-ticker {
  position: absolute;
  top: calc(56px + var(--top));
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.hud-ticker__pill {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 520px;
  padding: 6px 14px 6px 10px;
  color: var(--color-ink-soft);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
}
.hud-ticker__pill--live {
  --glass-border: var(--color-primary);
  color: var(--color-ink);
}
.hud-ticker__bell {
  flex: none;
  color: var(--color-primary);
}
.hud-ticker__track {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 17px;
  overflow: hidden;
}
.hud-ticker__text {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hud-ticker__text--scroll {
  max-width: none;
  overflow: visible;
  animation: ticker-scroll 6s ease-in-out 0.6s both;
}
@keyframes ticker-scroll {
  0%,
  12% {
    transform: none;
  }
  70%,
  100% {
    transform: translateX(var(--shift));
  }
}
.ticker-enter-active,
.ticker-leave-active {
  transition: transform 0.4s var(--ease-spring), opacity 0.3s ease;
}
.ticker-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.ticker-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .hud-ticker__text--scroll {
    animation: none;
  }
}
</style>
