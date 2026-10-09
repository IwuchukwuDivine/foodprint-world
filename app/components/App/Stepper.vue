<template>
  <div
    class="app-stepper"
    :class="[
      `app-stepper--${size}`,
      { 'app-stepper--collapsed': isCollapsed, 'opacity-50': disabled },
    ]"
    role="group"
    aria-label="Quantity"
  >
    <!--
      Kept in the DOM at zero so the pill can animate open/shut. `inert` takes
      the hidden minus button and count out of focus order and the a11y tree.
    -->
    <span class="app-stepper__collapsible" :inert="isCollapsed || undefined">
      <span class="app-stepper__inner">
        <button
          type="button"
          class="app-step-btn bg-wash text-primary-deep hover:bg-shell"
          :disabled="disabled || modelValue <= min"
          :aria-label="modelValue === 1 && collapsible ? 'Remove from cart' : 'Decrease quantity'"
          @click="change(-1)"
        >
          <Icon :name="modelValue === 1 && collapsible ? 'trash' : 'minus'" :size="iconSize" />
        </button>

        <span
          class="app-stepper__count text-center font-semibold tabular-nums text-ink"
          aria-live="polite"
        >
          {{ modelValue }}
        </span>
      </span>
    </span>

    <button
      type="button"
      class="app-step-btn bg-primary text-cream hover:bg-primary-deep"
      :disabled="disabled || modelValue >= max"
      :aria-label="isCollapsed ? addLabel : 'Increase quantity'"
      @click="change(1)"
    >
      <Icon name="plus" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Quantity stepper for cart items — clamps between min and max. */
    modelValue: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    /**
     * Cart mode: at 0 the pill shrinks to just the round "+". Decrementing
     * from 1 collapses it again. Needs `min` at 0 (the default).
     */
    collapsible?: boolean;
    /** Screen-reader label for the "+" while collapsed. */
    addLabel?: string;
    /**
     * `lg` for a control that is the point of the screen — the item sheet's
     * quantity, where the collapsed "+" is the primary affordance. `md` is the
     * in-a-list size (menu cards, cart rows).
     */
    size?: "md" | "lg";
  }>(),
  {
    min: 0,
    max: 99,
    disabled: false,
    collapsible: false,
    addLabel: "Add to cart",
    size: "md",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const isCollapsed = computed(() => props.collapsible && props.modelValue <= 0);

const iconSize = computed(() => (props.size === "lg" ? 20 : 16));

const change = (delta: number) => {
  const next = Math.min(props.max, Math.max(props.min, props.modelValue + delta));
  if (next !== props.modelValue) emit("update:modelValue", next);
};
</script>

<style scoped>
.app-stepper {
  /* One knob for the whole control: the round button's diameter. */
  --step-size: 34px;
  --step-gap: 4px;
  --step-count: 2.75rem;
  --step-font: 1rem;

  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: var(--step-gap);
  border: 1.5px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-surface);
  transition:
    background-color 0.25s var(--ease-spring),
    border-color 0.25s var(--ease-spring);
}

/* The item sheet's quantity, where the collapsed "+" *is* the call to action. */
.app-stepper--lg {
  --step-size: 46px;
  --step-gap: 5px;
  --step-count: 3.25rem;
  --step-font: 1.125rem;
}

.app-stepper__count {
  min-width: var(--step-count);
  font-size: var(--step-font);
}

/* Collapsed, the pill is just the round "+" — no ring around it. */
.app-stepper--collapsed {
  border-color: transparent;
  background: transparent;
}

/*
 * Animating to `width: 0` needs a known start width. A 1fr → 0fr grid column
 * collapses to nothing without one, so the pill can open from any content size.
 */
.app-stepper__collapsible {
  display: grid;
  grid-template-columns: 1fr;
  transition:
    grid-template-columns 0.28s var(--ease-spring),
    opacity 0.2s ease;
}
.app-stepper--collapsed .app-stepper__collapsible {
  grid-template-columns: 0fr;
  opacity: 0;
}

.app-stepper__inner {
  display: flex;
  min-width: 0;
  align-items: center;
  overflow: hidden;
}

.app-step-btn {
  display: grid;
  place-items: center;
  width: var(--step-size);
  height: var(--step-size);
  flex: none;
  border: none;
  border-radius: 50%;
  font: inherit;
  cursor: pointer;
  outline: none;
  transition:
    background-color 0.2s var(--ease-spring),
    transform 0.2s var(--ease-spring);
}
.app-step-btn:active:not(:disabled) {
  transform: scale(0.92);
}
.app-step-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.app-step-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* The "+" is the only affordance at zero — never dim it for hitting `min`. */
.app-stepper--collapsed .app-step-btn {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .app-stepper,
  .app-stepper__collapsible,
  .app-step-btn {
    transition: none;
  }
}
</style>
