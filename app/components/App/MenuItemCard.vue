<template>
  <article class="app-menu-item" :class="{ 'app-menu-item--off': !available }">
    <AppImg
      :src="photoUrl ?? undefined"
      :alt="name"
      aspect="square"
      rounded="lg"
      sizes="60px"
      class="app-menu-item__photo"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <h3 class="m-0 truncate text-[15px] font-semibold text-ink">{{ name }}</h3>
        <slot name="badge" />
      </div>
      <p v-if="description" class="app-menu-item__desc">{{ description }}</p>
      <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <AppPrice :kobo="priceKobo" size="sm" />
        <span v-if="!available" class="text-[12px] font-semibold uppercase tracking-wide text-danger">
          Sold out
        </span>
        <slot name="meta" />
      </div>
    </div>

    <div v-if="$slots.actions" class="flex flex-none flex-col items-end gap-2">
      <div class="flex items-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * Menu item row: photo, name, description, kobo price, with a sold-out label
 * when the dish is unavailable.
 */
withDefaults(
  defineProps<{
    name: string;
    priceKobo: number;
    description?: string | null;
    photoUrl?: string | null;
    available?: boolean;
  }>(),
  {
    description: null,
    photoUrl: null,
    available: true,
  },
);
</script>

<style scoped>
.app-menu-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-line-soft);
  border-radius: var(--radius-2xl, 16px);
  transition: opacity 0.15s ease;
}

.app-menu-item__photo {
  width: 60px;
  flex: none;
}

.app-menu-item--off .app-menu-item__photo,
.app-menu-item--off h3 {
  opacity: 0.55;
}

.app-menu-item__desc {
  margin: 2px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-ink-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
