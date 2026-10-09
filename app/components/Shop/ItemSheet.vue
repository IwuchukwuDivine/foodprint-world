<template>
  <AppBottomSlider
    :model-value="true"
    :title="item?.name ?? 'Dish'"
    role="customer"
    @update:model-value="back"
  >
    <template v-if="item && kitchen">
      <AppButton variant="ghost" size="sm" icon="chevron-left" class="-ml-3 mb-2" @click="back">
        {{ kitchen.name }}
      </AppButton>

      <AppImg
        :src="item.photoUrl ?? undefined"
        :alt="item.name"
        ratio="16 / 9"
        rounded="2xl"
        :fallback-icon-size="44"
        class="w-full"
      />

      <p v-if="item.description" class="mb-0 mt-3.5 text-sm leading-relaxed text-ink-soft">
        {{ item.description }}
      </p>

      <div class="mt-3 flex items-center gap-3">
        <AppPrice :kobo="item.priceKobo" size="lg" />
        <AppBadge v-if="!item.available" tone="danger" label="Sold out" />
      </div>

      <p v-if="blockedReason" class="shop-notice mt-4">
        <Icon name="info" :size="16" />
        <span>{{ blockedReason }}</span>
      </p>

      <div v-if="item.optionGroups.length" class="mt-6 flex flex-col gap-6">
        <AppOptionGroup
          v-for="group in item.optionGroups"
          :key="group.id"
          :model-value="selections[group.id] ?? {}"
          :title="group.name"
          :options="choicesFor(group)"
          :min="group.min"
          :max="group.max"
          :required="group.required"
          @update:model-value="selections[group.id] = $event"
          @update:valid="validity[group.id] = $event"
        />
      </div>

      <div class="mt-6 flex items-center justify-between">
        <span class="text-[15.5px] font-semibold text-ink">Quantity</span>
        <AppStepper
          v-model="quantity"
          collapsible
          size="lg"
          :max="20"
          add-label="Add one to tray"
        />
      </div>

      <div class="shop-sticky-footer">
        <AppButton variant="primary" size="lg" block :disabled="!canAdd" @click="submit">
          <span class="flex w-full items-center justify-between gap-3">
            <span>{{ addLabel }}</span>
            <span v-if="canAdd">{{ formatKobo(totalKobo) }}</span>
          </span>
        </AppButton>
      </div>
    </template>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="utensils" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">That dish is gone</p>
      <AppButton variant="secondary" size="sm" class="mt-2" @click="back">Back to the menu</AppButton>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useShopStore } from "~/stores/shop";
import type { MenuItem, OptionGroup, TrayLineOption } from "~/utils/types/shop";
import type { OptionChoice } from "~/utils/types/ui";
import { KITCHEN_BY_SLUG } from "~/utils/data/kitchens";
import { menuFor } from "~/utils/data/menus";
import formatKobo from "~/utils/formatKobo";
import { REQUEST_ADD_KEY } from "~/utils/shopKeys";

/**
 * The add-to-tray sheet. Option groups enforce their own min/max/required and
 * report validity up; a shut kitchen or a sold-out dish disables the action
 * with a reason rather than hiding it.
 */
const shop = useShopStore();
const requestAdd = inject(REQUEST_ADD_KEY, null);

const kitchen = computed(() => (shop.activeKitchenSlug ? KITCHEN_BY_SLUG[shop.activeKitchenSlug] ?? null : null));

const item = computed<MenuItem | null>(() => {
  if (!kitchen.value || !shop.activeItemId) return null;
  for (const section of menuFor(kitchen.value.slug)) {
    const found = section.items.find((candidate) => candidate.id === shop.activeItemId);
    if (found) return found;
  }
  return null;
});

/** Per group: chosen option ids to quantity. */
const selections = ref<Record<string, Record<string, number>>>({});
const validity = ref<Record<string, boolean>>({});
/* Starts collapsed: adding is an explicit act. */
const quantity = ref(0);

watch(
  () => item.value?.id,
  () => {
    selections.value = {};
    validity.value = {};
    quantity.value = 0;
    for (const group of item.value?.optionGroups ?? []) {
      selections.value[group.id] = {};
      validity.value[group.id] = !group.required && group.min === 0;
    }
  },
  { immediate: true },
);

const choicesFor = (group: OptionGroup): OptionChoice[] =>
  group.options.map((option) => ({
    id: option.id,
    name: option.name,
    priceDeltaKobo: option.priceDeltaKobo,
    available: option.available,
  }));

const chosenOptions = computed<TrayLineOption[]>(() => {
  const chosen: TrayLineOption[] = [];
  for (const group of item.value?.optionGroups ?? []) {
    for (const option of group.options) {
      const optionQuantity = selections.value[group.id]?.[option.id] ?? 0;
      if (optionQuantity < 1) continue;
      chosen.push({
        id: option.id,
        groupId: group.id,
        name: option.name,
        priceDeltaKobo: option.priceDeltaKobo,
        quantity: optionQuantity,
      });
    }
  }
  return chosen;
});

const unitKobo = computed(
  () =>
    (item.value?.priceKobo ?? 0)
    + chosenOptions.value.reduce((sum, option) => sum + option.priceDeltaKobo * option.quantity, 0),
);
const totalKobo = computed(() => unitKobo.value * quantity.value);

const optionsSatisfied = computed(() =>
  (item.value?.optionGroups ?? []).every((group) => validity.value[group.id]),
);

const blockedReason = computed(() => {
  if (!kitchen.value) return "";
  if (kitchen.value.storeState === "closed") {
    return `${kitchen.value.name} is closed right now. You can look, but not order yet.`;
  }
  if (kitchen.value.storeState === "paused") {
    return `${kitchen.value.name} has paused new orders for a moment. Try again shortly.`;
  }
  if (item.value && !item.value.available) {
    return "This dish is sold out. Check back later or pick something else.";
  }
  return "";
});

const canAdd = computed(() => !blockedReason.value && optionsSatisfied.value && quantity.value > 0);

const addLabel = computed(() => {
  if (blockedReason.value) {
    if (kitchen.value?.storeState === "closed") return "Kitchen closed";
    if (kitchen.value?.storeState === "paused") return "Orders paused";
    return "Sold out";
  }
  if (!optionsSatisfied.value) return "Choose your options";
  if (quantity.value === 0) return "Choose a quantity";
  return "Add to tray";
});

function back() {
  if (kitchen.value) shop.openStorefront(kitchen.value.slug);
  else shop.close();
}

function submit() {
  if (!item.value || !kitchen.value || !canAdd.value || !requestAdd) return;
  requestAdd({
    kitchenSlug: kitchen.value.slug,
    kitchenName: kitchen.value.name,
    itemId: item.value.id,
    name: item.value.name,
    photoUrl: item.value.photoUrl,
    unitPriceKobo: item.value.priceKobo,
    quantity: quantity.value,
    options: chosenOptions.value,
  });
}
</script>
