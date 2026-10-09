<template>
  <div
    class="inline-flex items-center gap-1"
    :role="readonly ? 'img' : 'radiogroup'"
    :aria-label="`Rating: ${modelValue} of ${max} stars`"
    @mouseleave="hovered = 0"
  >
    <component
      :is="readonly ? 'span' : 'button'"
      v-for="i in max"
      :key="i"
      :type="readonly ? undefined : 'button'"
      class="app-rating__star"
      :class="{
        'app-rating__star--active': i <= displayValue,
        'cursor-default': readonly,
      }"
      :aria-label="readonly ? undefined : `Rate ${i} star${i > 1 ? 's' : ''}`"
      @mouseenter="!readonly && (hovered = i)"
      @click="!readonly && emit('update:modelValue', i)"
    >
      <Icon
        name="star"
        :size="size"
        :class="i <= displayValue ? 'app-rating__fill' : ''"
      />
    </component>

    <span v-if="showValue" class="ml-1.5 text-sm font-semibold text-ink">
      {{ modelValue.toFixed(1) }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number;
    max?: number;
    size?: number;
    readonly?: boolean;
    showValue?: boolean;
  }>(),
  {
    max: 5,
    size: 22,
    readonly: false,
    showValue: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const hovered = ref(0);

const displayValue = computed(() =>
  hovered.value > 0 ? hovered.value : Math.round(props.modelValue),
);
</script>

<style scoped>
.app-rating__star {
  display: inline-flex;
  padding: 2px;
  border: none;
  background: transparent;
  color: var(--color-ink-faint);
  cursor: pointer;
  outline: none;
  transition:
    color 0.15s,
    transform 0.2s var(--ease-spring);
}
button.app-rating__star:hover {
  transform: scale(1.15);
}
.app-rating__star:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 6px;
}
.app-rating__star--active {
  color: var(--color-gold);
}
.app-rating__fill :deep(path:first-child) {
  fill: var(--color-gold);
  stroke: var(--color-gold);
}
</style>
