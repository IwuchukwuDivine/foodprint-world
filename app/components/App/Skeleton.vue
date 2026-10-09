<template>
  <span
    class="app-skeleton"
    :class="{
      'rounded-full': variant === 'circle',
      'rounded-lg': variant === 'rect',
      'h-3.5 rounded': variant === 'text',
    }"
    :style="{ width, height: variant === 'text' ? undefined : height }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "text" | "rect" | "circle";
    width?: string;
    height?: string;
  }>(),
  {
    variant: "text",
    width: "100%",
    height: "1rem",
  },
);
</script>

<style scoped>
.app-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--color-shell) 25%,
    var(--color-mist) 50%,
    var(--color-shell) 75%
  );
  background-size: 200% 100%;
  animation: app-skeleton-shimmer 1.4s ease infinite;
}
@keyframes app-skeleton-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-skeleton {
    animation: none;
    background: var(--color-shell);
  }
}
</style>
