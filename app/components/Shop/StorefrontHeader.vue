<template>
  <header class="storefront-header">
    <AppImg
      :src="kitchen.coverUrl"
      :alt="`${kitchen.name} cover photo`"
      ratio="16 / 9"
      rounded="2xl"
      :fallback-icon-size="40"
      class="w-full"
    />

    <div class="storefront-header__logo">
      <AppAvatar :name="kitchen.name" :src="kitchen.logoUrl" size="xl" />
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <h3 class="m-0 text-[19px] font-semibold leading-tight text-ink">{{ kitchen.name }}</h3>
      <AppBadge :tone="stateMeta.tone" :label="stateMeta.label" dot />
    </div>

    <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13.5px] text-ink-muted">
      <span class="inline-flex items-center gap-1.5">
        <AppRating :model-value="kitchen.ratingAvg" readonly show-value :size="15" />
        <span>({{ kitchen.ratingCount }})</span>
      </span>
      <span class="inline-flex items-center gap-1">
        <Icon name="clock" :size="14" />
        ~{{ kitchen.avgPrepMinutes }} min
      </span>
      <span class="inline-flex items-center gap-1">
        <Icon name="pin" :size="14" />
        {{ kitchen.district }}
      </span>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <AppChip
        v-for="category in kitchen.categories"
        :key="category"
        :label="humanizeSlug(category)"
      />
    </div>

    <p class="mb-0 mt-3 text-sm leading-relaxed text-ink-soft">{{ kitchen.description }}</p>
  </header>
</template>

<script setup lang="ts">
import type { Kitchen, StoreState } from "~/utils/types/shop";
import type { BadgeTone } from "~/utils/types/ui";
import humanizeSlug from "~/utils/humanizeSlug";

const props = defineProps<{ kitchen: Kitchen }>();

const STATE_META: Record<StoreState, { label: string; tone: BadgeTone }> = {
  open: { label: "Open", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
  paused: { label: "Paused", tone: "gold" },
};

const stateMeta = computed(() => STATE_META[props.kitchen.storeState]);
</script>

<style scoped>
.storefront-header__logo {
  margin-top: -32px;
  margin-left: 14px;
  width: max-content;
  padding: 3px;
  border-radius: 999px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
</style>
