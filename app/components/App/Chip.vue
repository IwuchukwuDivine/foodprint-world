<template>
  <button
    type="button"
    class="app-chip"
    :class="{ 'app-chip--selected': modelValue, 'app-chip--disabled': disabled }"
    :disabled="disabled"
    :aria-pressed="modelValue"
    @click="toggle"
  >
    <Icon v-if="modelValue" name="check" :size="12" />
    <Icon v-else-if="icon" :name="icon" :size="14" />
    <slot>{{ label }}</slot>
    <span
      v-if="removable"
      class="app-chip__remove"
      role="button"
      aria-label="Remove"
      @click.stop="emit('remove')"
    >
      <Icon name="close" :size="9" />
    </span>
  </button>
</template>

<script setup lang="ts">
import type { IconName } from "~/utils/types/icons";

const props = withDefaults(
  defineProps<{
    /** Selected state — filter chips toggle it via v-model. */
    modelValue?: boolean;
    label?: string;
    icon?: IconName;
    removable?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: false,
    label: undefined,
    icon: undefined,
    removable: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  remove: [];
}>();

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};
</script>

<style scoped>
.app-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--color-line);
  background: var(--color-surface);
  color: var(--color-ink);
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s var(--ease-spring);
}
.app-chip:hover:not(:disabled) {
  border-color: var(--color-primary);
}
.app-chip:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.app-chip--selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-cream);
}
.app-chip--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.app-chip__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: -6px;
  border-radius: 50%;
  background: color-mix(in oklab, var(--color-primary-deep) 12%, transparent);
  transition: background-color 0.2s var(--ease-spring);
}
.app-chip--selected .app-chip__remove {
  background: rgb(255 246 239 / 0.25);
}
.app-chip__remove:hover {
  background: color-mix(in oklab, var(--color-primary-deep) 25%, transparent);
}
</style>
