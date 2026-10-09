<template>
  <AppBottomSlider :model-value="true" title="Your tray" role="customer" @update:model-value="shop.close()">
    <template v-if="!tray.isEmpty">
      <p class="m-0 -mt-1 flex items-center gap-1.5 text-[13.5px] text-ink-muted">
        <Icon name="store" :size="14" />
        From {{ tray.kitchenName }}
      </p>

      <div class="mt-2 divide-y divide-line-soft">
        <ShopTrayLineRow
          v-for="line in tray.lines"
          :key="line.lineId"
          :line="line"
          @update:quantity="tray.setQuantity(line.lineId, $event)"
        />
      </div>

      <AppButton
        v-if="tray.kitchenSlug"
        variant="ghost"
        size="sm"
        icon="plus"
        class="-ml-3 mt-1"
        @click="shop.openStorefront(tray.kitchenSlug)"
      >
        Add more
      </AppButton>

      <AppFeeSummary
        class="mt-4"
        :subtotal-kobo="tray.subtotalKobo"
        :delivery-fee-kobo="null"
        :service-fee-kobo="serviceFeeKobo"
        :total-kobo="null"
      >
        <template #note>Delivery is quoted at checkout, by your home district.</template>
      </AppFeeSummary>

      <div class="shop-sticky-footer">
        <AppButton variant="primary" size="lg" block @click="shop.open('checkout')">
          <span class="flex w-full items-center justify-between gap-3">
            <span>Checkout</span>
            <span>{{ tray.count }} {{ tray.count === 1 ? "item" : "items" }}</span>
          </span>
        </AppButton>
      </div>
    </template>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="bag" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">Your tray is empty</p>
      <p class="m-0 text-sm text-ink-muted">Walk up to a kitchen and pick something good.</p>
      <AppButton variant="secondary" size="sm" class="mt-3" @click="shop.close()">Back to the street</AppButton>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useShopStore } from "~/stores/shop";
import { useTrayStore } from "~/stores/tray";
import { quoteFees } from "~/utils/constants/fees";

const shop = useShopStore();
const tray = useTrayStore();

/* Delivery is unknown until checkout names the district, so only the service
   fee is quoted here; the kit renders "At checkout" for the null lines. */
const serviceFeeKobo = computed(() => quoteFees(tray.subtotalKobo, 0).serviceFeeKobo);
</script>
