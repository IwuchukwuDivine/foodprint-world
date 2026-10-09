<template>
  <span class="app-pulse" :style="rootStyle">
    <span class="app-pulse__halo" aria-hidden="true" />
    <span class="app-pulse__core" :class="{ 'app-pulse__core--filled': filled }">
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import type { AccentTone } from "~/utils/types/ui";

/**
 * The pulsing halo: "Finding you a rider…", live status dots, the tracker's
 * active stage. With a slot it renders a filled accent disc around the content;
 * without one, a bare dot.
 */
const props = withDefaults(
  defineProps<{
    /** Diameter of the core, in px. 10 reads as a status dot, 46 as an icon disc. */
    size?: number;
    tone?: AccentTone;
    /** Fills the core with the tone. Off = a ring-less transparent core. */
    filled?: boolean;
  }>(),
  {
    size: 46,
    tone: "primary",
    filled: true,
  },
);

const TONE_VARS: Record<AccentTone, string> = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  gold: "var(--color-gold)",
  danger: "var(--color-danger)",
  rider: "var(--color-rider)",
};

const rootStyle = computed(() => ({
  "--pulse-size": `${props.size}px`,
  "--pulse-tone": TONE_VARS[props.tone],
}));
</script>

<style scoped>
.app-pulse {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: var(--pulse-size);
  height: var(--pulse-size);
}

/* The halo grows out from behind the core and fades — a ring leaving, not a
   ring sitting there. Starting under 1 keeps it hidden until it emerges. */
.app-pulse__halo {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--pulse-tone);
  opacity: 0;
  animation: app-pulse-ring 1.8s var(--ease-spring) infinite;
}

.app-pulse__core {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  color: var(--color-cream);
}
.app-pulse__core--filled {
  background: var(--pulse-tone);
}

@keyframes app-pulse-ring {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  20% {
    opacity: 0.4;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-pulse__halo {
    animation: none;
    opacity: 0.2;
  }
}
</style>
