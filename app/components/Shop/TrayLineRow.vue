<template>
  <div class="flex items-center gap-3 py-3">
    <AppImg
      :src="line.photoUrl ?? undefined"
      :alt="line.name"
      aspect="square"
      rounded="lg"
      :fallback-icon-size="20"
      class="w-14 flex-none"
    />
    <div class="min-w-0 flex-1">
      <p class="m-0 truncate text-[15px] font-semibold text-ink">{{ line.name }}</p>
      <p v-if="optionSummary" class="m-0 mt-0.5 truncate text-[13px] text-ink-muted">{{ optionSummary }}</p>
      <AppPrice :kobo="lineTotalKobo(line)" size="sm" class="mt-1" />
    </div>
    <AppStepper
      :model-value="line.quantity"
      :min="0"
      :max="20"
      size="md"
      @update:model-value="emit('update:quantity', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { TrayLine } from "~/utils/types/shop";
import { lineTotalKobo } from "~/stores/tray";

const props = defineProps<{ line: TrayLine }>();

const emit = defineEmits<{
  /** Zero means remove; the store handles that. */
  "update:quantity": [quantity: number];
}>();

const optionSummary = computed(() =>
  props.line.options
    .map((option) => (option.quantity > 1 ? `${option.quantity}x ${option.name}` : option.name))
    .join(", "),
);
</script>
