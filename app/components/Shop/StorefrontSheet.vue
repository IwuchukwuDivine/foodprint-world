<template>
  <AppBottomSlider
    :model-value="true"
    :title="kitchen?.name ?? 'Kitchen'"
    role="customer"
    @update:model-value="shop.close()"
  >
    <template v-if="kitchen">
      <ShopStorefrontHeader :kitchen="kitchen" />

      <section v-for="section in sections" :key="section.id" class="mt-7">
        <h4 class="m-0 mb-2.5 text-[15.5px] font-semibold text-ink">{{ section.name }}</h4>
        <div class="flex flex-col gap-2">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="storefront-row"
            role="button"
            tabindex="0"
            :aria-label="`View ${item.name}`"
            @click="shop.openItem(item.id)"
            @keydown.enter.prevent="shop.openItem(item.id)"
            @keydown.space.prevent="shop.openItem(item.id)"
          >
            <AppMenuItemCard
              :name="item.name"
              :price-kobo="item.priceKobo"
              :description="item.description"
              :photo-url="item.photoUrl"
              :available="item.available"
            >
              <template #actions>
                <AppButton
                  variant="secondary"
                  size="sm"
                  icon="plus"
                  :aria-label="`Add ${item.name}`"
                  @click.stop="shop.openItem(item.id)"
                />
              </template>
            </AppMenuItemCard>
          </div>
        </div>
      </section>

      <div v-if="sections.length === 0" class="shop-empty mt-8">
        <span class="shop-empty__icon"><Icon name="utensils" :size="26" /></span>
        <p class="m-0 text-[15px] font-semibold text-ink">No menu yet</p>
        <p class="m-0 text-sm text-ink-muted">This kitchen hasn't listed any dishes.</p>
      </div>

      <div v-if="trayIsHere" class="shop-sticky-footer">
        <AppButton variant="primary" size="lg" block @click="shop.open('tray')">
          <span class="flex w-full items-center justify-between gap-3">
            <span>View tray · {{ tray.count }} {{ tray.count === 1 ? "item" : "items" }}</span>
            <AppPrice :kobo="tray.subtotalKobo" tone="inverse" />
          </span>
        </AppButton>
      </div>
    </template>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="store" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">Kitchen not found</p>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useShopStore } from "~/stores/shop";
import { useTrayStore } from "~/stores/tray";
import { KITCHEN_BY_SLUG } from "~/utils/data/kitchens";
import { menuFor } from "~/utils/data/menus";

const shop = useShopStore();
const tray = useTrayStore();

const kitchen = computed(() => (shop.activeKitchenSlug ? KITCHEN_BY_SLUG[shop.activeKitchenSlug] ?? null : null));
const sections = computed(() => (kitchen.value ? menuFor(kitchen.value.slug) : []));

/** Only this kitchen's tray earns the footer; another kitchen's lines are not "yours here". */
const trayIsHere = computed(
  () => !!kitchen.value && tray.count > 0 && tray.kitchenSlug === kitchen.value.slug,
);
</script>

<style scoped>
.storefront-row {
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s var(--ease-spring);
}
.storefront-row:hover {
  background: var(--color-surface-alt);
}
.storefront-row:active {
  transform: scale(0.99);
}
.storefront-row:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
