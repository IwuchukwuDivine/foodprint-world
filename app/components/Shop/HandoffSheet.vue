<template>
  <AppBottomSlider :model-value="true" title="Your rider is here" role="customer" @update:model-value="shop.close()">
    <template v-if="active">
      <div class="flex items-center gap-3">
        <AppAvatar :name="active.riderName" size="lg" presence="online" />
        <div class="min-w-0">
          <p class="m-0 text-[15.5px] font-semibold text-ink">{{ active.riderName }}</p>
          <p class="m-0 text-[13px] text-ink-muted">Foodprint rider · Order {{ active.code }}</p>
        </div>
      </div>

      <p class="mb-0 mt-4 text-sm leading-relaxed text-ink-soft">
        Read this code to {{ active.riderName }} to collect your food.
      </p>

      <div class="mt-4 flex justify-center">
        <AppOtpDisplay :code="active.otp" variant="boxed" caption="Your delivery code" :copyable="false" />
      </div>

      <div class="shop-sticky-footer">
        <AppButton variant="primary" size="lg" block icon="check" @click="confirm">Confirm handoff</AppButton>
      </div>
    </template>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="rider" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">No delivery to hand off</p>
      <AppButton variant="secondary" size="sm" class="mt-2" @click="shop.close()">Close</AppButton>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useOrderStore } from "~/stores/order";
import { useShopStore } from "~/stores/shop";

/* Closing without confirming is fine: the engine reopens the sheet when the
   player comes back to the door. */
const shop = useShopStore();
const order = useOrderStore();
const toast = useToast();

const active = computed(() => order.activeOrder);

function confirm() {
  if (order.confirmHandoff()) {
    shop.open("rating");
  } else {
    toast.error("The handoff can't be confirmed yet");
  }
}
</script>
