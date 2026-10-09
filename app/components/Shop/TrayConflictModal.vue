<template>
  <AppModal
    :model-value="modelValue"
    size="sm"
    role="customer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col items-center gap-3 text-center">
      <span class="grid h-[58px] w-[58px] place-items-center rounded-full bg-gold/20 text-gold-ink">
        <Icon name="bag" :size="28" />
      </span>
      <h2 class="m-0 text-[19px] font-bold text-ink">Start a new tray?</h2>
      <p class="m-0 text-sm leading-relaxed text-ink-soft">
        Your tray has food from <b class="text-ink">{{ currentKitchenName }}</b>. You can
        only order from one kitchen at a time.
      </p>
      <div class="mt-3 flex w-full flex-col gap-2.5">
        <AppButton variant="primary" block @click="emit('replace')">Start new tray</AppButton>
        <AppButton variant="secondary" block @click="emit('update:modelValue', false)">
          Keep current tray
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
/** One kitchen per tray. Adding from a second kitchen asks before it discards. */
defineProps<{
  modelValue: boolean;
  currentKitchenName: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [open: boolean];
  /** Empty the tray and add the pending line. */
  replace: [];
}>();
</script>
