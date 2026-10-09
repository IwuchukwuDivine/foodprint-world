<template>
  <div
    class="app-tracker"
    :class="{ 'app-tracker--vertical': vertical }"
    role="list"
    aria-label="Order progress"
  >
    <div class="app-tracker__rail" aria-hidden="true">
      <div class="app-tracker__fill" :style="{ '--p': `${fillPct}%` }" />
    </div>

    <div
      v-for="(stage, index) in stages"
      :key="stage.label"
      class="app-tracker__step"
      role="listitem"
      :aria-current="index === current ? 'step' : undefined"
    >
      <span class="relative h-10 w-10 flex-none">
        <span
          v-if="index === current && !isComplete"
          class="app-tracker__pulse"
          aria-hidden="true"
        />
        <span
          class="app-tracker__dot"
          :class="{
            'app-tracker__dot--done': index < current || (index === current && isComplete),
            'app-tracker__dot--current': index === current && !isComplete,
          }"
        >
          <Icon
            v-if="index < current || (index === current && isComplete)"
            name="check"
            :size="16"
            class="text-cream"
          />
          <span
            v-else-if="index === current"
            class="h-2.5 w-2.5 rounded-full bg-cream"
          />
          <!-- Unreached stages stay quiet: a step number would compete with the
               timestamps for attention, and the order of the list already says
               which step is which. -->
          <span v-else class="h-[7px] w-[7px] rounded-full bg-ink-disabled" />
        </span>
      </span>

      <span class="flex min-w-0 flex-col gap-px">
        <span
          class="text-sm font-semibold transition-colors duration-300"
          :class="index <= current ? 'text-ink' : 'text-ink-faint'"
        >
          {{ stage.label }}
        </span>
        <span class="text-xs text-ink-muted">
          {{ index <= current ? (stage.time ?? "") : "" }}
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrackerStage } from "~/utils/types/ui";

const props = withDefaults(
  defineProps<{
    /** Ordered stages; `current` is the index of the active stage. */
    stages: TrackerStage[];
    current: number;
    /** Stack steps vertically — for narrow/mobile layouts. */
    vertical?: boolean;
  }>(),
  {
    vertical: false,
  },
);

const isComplete = computed(() => props.current >= props.stages.length - 1);

const fillPct = computed(() => {
  const last = props.stages.length - 1;
  if (last <= 0) return 0;
  return Math.min(100, Math.max(0, (props.current / last) * 100));
});
</script>

<style scoped>
.app-tracker {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.app-tracker__rail {
  position: absolute;
  left: 20px;
  right: 20px;
  top: 16px;
  height: 4px;
  border-radius: 999px;
  background: var(--color-shell);
}
.app-tracker__fill {
  width: var(--p);
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-success), var(--color-primary));
  transition: width 0.35s var(--ease-spring);
}
.app-tracker__step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  text-align: center;
}
.app-tracker__dot {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-line);
  transition:
    background-color 0.3s var(--ease-spring),
    border-color 0.3s var(--ease-spring);
}
.app-tracker__dot--done {
  background: var(--color-success);
  border-color: var(--color-success);
}
.app-tracker__dot--current {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.app-tracker__pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: color-mix(in oklab, var(--color-primary) 35%, transparent);
  animation: app-tracker-pulse 1.8s var(--ease-spring) infinite;
}
/* Same ring as AppPulse: grows out from under the dot rather than starting
   at full size, so it reads as emitted instead of merely expanding. */
@keyframes app-tracker-pulse {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  20% {
    opacity: 0.65;
  }
  100% {
    transform: scale(2.3);
    opacity: 0;
  }
}

/* Vertical variant — also applied automatically under 760px */
.app-tracker--vertical {
  flex-direction: column;
  gap: 22px;
}
.app-tracker--vertical .app-tracker__rail {
  left: 18px;
  right: auto;
  top: 20px;
  bottom: 20px;
  width: 4px;
  height: auto;
}
.app-tracker--vertical .app-tracker__fill {
  width: 100%;
  height: var(--p);
  background: linear-gradient(180deg, var(--color-success), var(--color-primary));
  transition: height 0.35s var(--ease-spring);
}
.app-tracker--vertical .app-tracker__step {
  flex-direction: row;
  text-align: left;
  gap: 14px;
}
@media (max-width: 760px) {
  .app-tracker:not(.app-tracker--vertical) {
    flex-direction: column;
    gap: 22px;
  }
  .app-tracker:not(.app-tracker--vertical) .app-tracker__rail {
    left: 18px;
    right: auto;
    top: 20px;
    bottom: 20px;
    width: 4px;
    height: auto;
  }
  .app-tracker:not(.app-tracker--vertical) .app-tracker__fill {
    width: 100%;
    height: var(--p);
    background: linear-gradient(180deg, var(--color-success), var(--color-primary));
    transition: height 0.35s var(--ease-spring);
  }
  .app-tracker:not(.app-tracker--vertical) .app-tracker__step {
    flex-direction: row;
    text-align: left;
    gap: 14px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-tracker__pulse {
    animation: none;
  }
}
</style>
