<template>
  <AppBottomSlider :model-value="true" title="Rate your order" role="customer" @update:model-value="shop.close()">
    <div v-if="active" class="flex flex-col gap-4 pb-2">
      <p class="m-0 text-[14px] leading-relaxed text-ink-muted">
        How was {{ active.kitchenName }}? Your rating helps keep the good kitchens on the app.
      </p>

      <div class="rating-block">
        <p class="m-0 text-[13px] font-semibold text-ink">The kitchen</p>
        <AppRating v-model="kitchenStars" :size="28" class="mt-2" />
      </div>

      <div class="rating-block">
        <p class="m-0 text-[13px] font-semibold text-ink">Your rider, {{ active.riderName }}</p>
        <AppRating v-model="riderStars" :size="28" class="mt-2" />
      </div>

      <label class="flex flex-col gap-1.5">
        <span class="field-label">Anything else? (optional)</span>
        <div class="field-shell px-3.5 py-2.5">
          <textarea
            v-model="comment"
            class="field-control resize-none"
            rows="3"
            maxlength="300"
            placeholder="Food temperature, packaging, delivery time"
          />
        </div>
      </label>

      <AppButton variant="primary" size="lg" block :disabled="!canSubmit" @click="submit">
        Submit rating
      </AppButton>
    </div>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="star" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">Nothing to rate yet</p>
      <AppButton variant="secondary" size="sm" class="mt-2" @click="shop.close()">Close</AppButton>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useOrderStore } from "~/stores/order";
import { useShopStore } from "~/stores/shop";

const shop = useShopStore();
const order = useOrderStore();
const toast = useToast();

const active = computed(() => order.activeOrder);

const kitchenStars = ref(0);
const riderStars = ref(0);
const comment = ref("");

const canSubmit = computed(() => kitchenStars.value >= 1 && riderStars.value >= 1);

function submit() {
  if (!canSubmit.value) return;
  order.rate({ kitchen: kitchenStars.value, rider: riderStars.value, comment: comment.value.trim() });
  toast.success("Thanks, your rating helps everyone");
  order.dismiss();
  shop.close();
}
</script>

<style scoped>
.rating-block {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid var(--color-line-soft);
  background: var(--color-surface);
}
</style>
