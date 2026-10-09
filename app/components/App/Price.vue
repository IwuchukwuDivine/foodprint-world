<template>
  <span class="inline-flex items-baseline gap-2">
    <span class="font-semibold tabular-nums" :class="[sizeClass, priceClass]">
      {{ formatKobo(kobo) }}
    </span>
    <span
      v-if="originalKobo && originalKobo > kobo"
      class="text-[0.8em] font-medium tabular-nums line-through"
      :class="originalClass"
    >
      {{ formatKobo(originalKobo) }}
    </span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Amount in kobo — matches the DATA_MODEL money invariant (`*_kobo`). */
    kobo: number;
    /** Pre-discount price in kobo; renders struck-through when higher. */
    originalKobo?: number;
    size?: "sm" | "md" | "lg";
    /** `inverse` carries the price on photos and coloured fills (AppComboCard). */
    tone?: "default" | "inverse";
  }>(),
  {
    originalKobo: undefined,
    size: "md",
    tone: "default",
  },
);

const sizeClass = computed(
  () => ({ sm: "text-sm", md: "text-base", lg: "text-xl" })[props.size],
);

const priceClass = computed(() =>
  props.tone === "inverse" ? "text-cream" : "text-primary-deep",
);

const originalClass = computed(() =>
  props.tone === "inverse" ? "text-cream/70" : "text-ink-faint",
);
</script>
