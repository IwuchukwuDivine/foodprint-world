<template>
  <span class="app-badge" :class="[`app-badge--${tone}`, { 'app-badge--solid': solid }]">
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    <Icon v-else-if="icon" :name="icon" :size="12" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import type { BadgeTone } from "~/utils/types/ui";
import type { IconName } from "~/utils/types/icons";

withDefaults(
  defineProps<{
    /** Status pill tones: primary = in progress, success = delivered, danger = cancelled, neutral = scheduled. */
    tone?: BadgeTone;
    label?: string;
    icon?: IconName;
    dot?: boolean;
    /**
     * Fills with the tone at full strength. The default tints are translucent,
     * so they turn to mud on a photo or a coloured fill — use `solid` there.
     */
    solid?: boolean;
  }>(),
  {
    tone: "neutral",
    label: undefined,
    icon: undefined,
    dot: false,
    solid: false,
  },
);
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
  white-space: nowrap;
}
.app-badge--primary {
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
  color: var(--color-primary-deep);
}
.app-badge--success {
  background: color-mix(in oklab, var(--color-success) 12%, transparent);
  color: var(--color-success);
}
.app-badge--danger {
  background: color-mix(in oklab, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}
.app-badge--gold {
  background: color-mix(in oklab, var(--color-gold) 18%, transparent);
  color: var(--color-gold-ink);
}
.app-badge--neutral {
  background: color-mix(in oklab, var(--color-ink) 7%, transparent);
  color: var(--color-ink-soft);
}

/* Solid — opaque fills for badges that sit on photos or coloured surfaces.
   Gold is light enough to need ink; the rest carry cream. */
.app-badge--solid {
  color: var(--color-cream);
}
.app-badge--solid.app-badge--primary {
  background: var(--color-primary);
}
.app-badge--solid.app-badge--success {
  background: var(--color-success);
}
.app-badge--solid.app-badge--danger {
  background: var(--color-danger);
}
.app-badge--solid.app-badge--gold {
  background: var(--color-gold);
  color: var(--color-cream-ink);
}
/* Solid neutral is a scrim chip on a photo ("Closed") — static in both themes,
   so it can't ride --color-ink, which goes light in dark mode. */
.app-badge--solid.app-badge--neutral {
  background: var(--color-cream-ink);
}
</style>
