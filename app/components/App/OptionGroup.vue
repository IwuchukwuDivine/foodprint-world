<template>
  <fieldset class="app-option-group">
    <legend class="app-option-group__legend">
      <span class="text-[15.5px] font-semibold text-ink">{{ title }}</span>
      <span class="app-option-group__hint" :class="`app-option-group__hint--${required ? 'required' : 'optional'}`">
        {{ hint }}
      </span>
    </legend>

    <div
      v-for="option in options"
      :key="option.id"
      class="app-option-group__row"
      :class="{
        'app-option-group__row--selected': isSelected(option.id),
        'app-option-group__row--disabled': isDisabled(option),
      }"
    >
      <!-- The toggle covers the whole row (via ::after) until a stepper needs
           the right side — nested interactive elements are what the split
           structure avoids. -->
      <button
        type="button"
        class="app-option-group__toggle"
        :class="{ 'app-option-group__toggle--full': !hasStepper(option) }"
        :disabled="isDisabled(option)"
        :role="isSingleSelect ? 'radio' : 'checkbox'"
        :aria-checked="isSelected(option.id)"
        @click="toggle(option.id)"
      >
        <span
          class="app-option-group__mark"
          :class="{ 'app-option-group__mark--square': !isSingleSelect }"
        >
          <Icon v-if="isSelected(option.id)" name="check" :size="14" />
        </span>
        <span class="truncate text-[14.5px] font-medium text-ink">{{ option.name }}</span>
      </button>

      <!-- A selected option in a multi-select group grows a stepper, so a
           paid extra can be taken more than once ("2× extra fufu"). -->
      <span v-if="hasStepper(option)" class="app-option-group__stepper">
        <button
          type="button"
          class="app-option-group__step"
          :aria-label="`One less ${option.name}`"
          @click="setQuantity(option.id, quantityOf(option.id) - 1)"
        >
          <Icon :name="quantityOf(option.id) === 1 ? 'trash' : 'minus'" :size="13" />
        </button>
        <span class="app-option-group__count" aria-live="polite">{{ quantityOf(option.id) }}</span>
        <button
          type="button"
          class="app-option-group__step"
          :disabled="unitsUsed >= max"
          :aria-label="`One more ${option.name}`"
          @click="setQuantity(option.id, quantityOf(option.id) + 1)"
        >
          <Icon name="plus" :size="13" />
        </button>
      </span>

      <span
        v-else
        class="app-option-group__price"
        :class="{ 'text-ink-muted': !option.priceDeltaKobo }"
      >
        <template v-if="option.available === false">Unavailable</template>
        <template v-else-if="option.priceDeltaKobo">+{{ formatKobo(option.priceDeltaKobo) }}</template>
        <template v-else>Free</template>
      </span>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { OptionChoice } from "~/utils/types/ui";

/**
 * One `option_groups` row and its `options`. min/max/required come straight off
 * the DB: max === 1 makes it single-select (radio), anything else multi-select
 * (checkbox rows that grow a quantity stepper once picked). min/max bound the
 * group's *total units* — two of one extra spends the cap exactly like one
 * each of two — matching how the server validates at checkout.
 */
const props = withDefaults(
  defineProps<{
    /** Selected option ids → quantity (v-model). Single-select holds one id at 1. */
    modelValue: Record<string, number>;
    title: string;
    options: OptionChoice[];
    min?: number;
    max?: number;
    required?: boolean;
  }>(),
  {
    min: 0,
    max: 1,
    required: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, number>];
  /** Whether the group's min/max constraints are currently satisfied. */
  "update:valid": [valid: boolean];
}>();

const isSingleSelect = computed(() => props.max === 1);

const quantityOf = (id: string) => props.modelValue[id] ?? 0;
const isSelected = (id: string) => quantityOf(id) > 0;

/** Total units taken across the group — what min/max actually bound. */
const unitsUsed = computed(() =>
  Object.values(props.modelValue).reduce((sum, quantity) => sum + quantity, 0),
);

const hasStepper = (option: OptionChoice) =>
  !isSingleSelect.value && isSelected(option.id) && option.available !== false;

/* A sold-out option stays visible but unpickable; so does any unselected option
   once the group is full — the cap should feel like a wall, not a silent no-op. */
const isDisabled = (option: OptionChoice) =>
  option.available === false
  || (!isSingleSelect.value && !isSelected(option.id) && unitsUsed.value >= props.max);

const hint = computed(() => {
  if (props.required) {
    return isSingleSelect.value ? "Required · pick 1" : `Required · pick up to ${props.max}`;
  }
  return isSingleSelect.value ? "Optional" : `Optional · up to ${props.max}`;
});

const toggle = (id: string) => {
  if (isSingleSelect.value) {
    /* Re-tapping the choice in an optional single-select group clears it. */
    const next = isSelected(id) && !props.required ? {} : { [id]: 1 };
    emit("update:modelValue", next);
    return;
  }
  if (isSelected(id)) {
    emit("update:modelValue", withoutOption(id));
    return;
  }
  if (unitsUsed.value >= props.max) return;
  emit("update:modelValue", { ...props.modelValue, [id]: 1 });
};

const withoutOption = (id: string) =>
  Object.fromEntries(Object.entries(props.modelValue).filter(([key]) => key !== id));

const setQuantity = (id: string, quantity: number) => {
  if (quantity <= 0) {
    emit("update:modelValue", withoutOption(id));
    return;
  }
  /* Never let one option push the group past its unit cap. */
  const headroom = props.max - (unitsUsed.value - quantityOf(id));
  emit("update:modelValue", { ...props.modelValue, [id]: Math.min(quantity, headroom) });
};

const isValid = computed(() => {
  const units = unitsUsed.value;
  if (units > props.max) return false;
  const floor = props.required ? Math.max(props.min, 1) : props.min;
  return units >= floor;
});

watch(isValid, (valid) => emit("update:valid", valid), { immediate: true });
</script>

<style scoped>
.app-option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: none;
}

.app-option-group__legend {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  margin-bottom: 2px;
}

.app-option-group__hint {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}
.app-option-group__hint--required {
  background: color-mix(in oklab, var(--color-primary) 10%, transparent);
  color: var(--color-primary-deep);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.app-option-group__hint--optional {
  background: color-mix(in oklab, var(--color-ink) 5%, transparent);
  color: var(--color-ink-muted);
  font-weight: 600;
}

.app-option-group__row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 13px 15px;
  border: 1.5px solid var(--color-line);
  border-radius: 14px;
  background: var(--color-surface);
  transition:
    border-color 0.2s var(--ease-spring),
    background-color 0.2s var(--ease-spring);
}
.app-option-group__row:hover:not(.app-option-group__row--disabled) {
  border-color: var(--color-primary);
}
.app-option-group__row:has(.app-option-group__toggle:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.app-option-group__row--selected {
  border-color: var(--color-primary);
  background: var(--color-wash);
}
.app-option-group__row--disabled {
  opacity: 0.55;
}
.app-option-group__row--disabled .app-option-group__toggle {
  cursor: not-allowed;
}

.app-option-group__toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
}
/* Without a stepper beside it, the toggle's hit area is the whole row. */
.app-option-group__toggle--full::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.app-option-group__mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--color-ink-disabled);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-cream);
  transition:
    background-color 0.2s var(--ease-spring),
    border-color 0.2s var(--ease-spring);
}
.app-option-group__mark--square {
  border-radius: 7px;
}
.app-option-group__row--selected .app-option-group__mark {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.app-option-group__stepper {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: none;
}
.app-option-group__step {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1.5px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-ink-soft);
  cursor: pointer;
  transition:
    border-color 0.2s var(--ease-spring),
    color 0.2s var(--ease-spring);
}
.app-option-group__step:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.app-option-group__step:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}
.app-option-group__step:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.app-option-group__count {
  min-width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.app-option-group__price {
  flex: none;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-ink-soft);
}
</style>
