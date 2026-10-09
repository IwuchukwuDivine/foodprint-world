<template>
  <AppBottomSlider :model-value="true" title="Checkout" role="customer" @update:model-value="shop.close()">
    <template v-if="!tray.isEmpty && kitchen">
      <AppButton variant="ghost" size="sm" icon="chevron-left" class="-ml-3 mb-2" @click="shop.open('tray')">
        Your tray
      </AppButton>

      <div class="flex flex-col gap-3">
        <div class="shop-card">
          <span class="shop-card__icon"><Icon name="pin" :size="18" /></span>
          <div class="min-w-0 flex-1">
            <p class="shop-card__eyebrow">Deliver to</p>
            <p class="shop-card__title">Your place</p>
            <p class="shop-card__sub">{{ homeDistrictName }}</p>
          </div>
          <AppPrice :kobo="deliveryFeeKobo" size="sm" class="mt-1" />
        </div>

        <div class="shop-card">
          <span class="shop-card__icon"><Icon name="store" :size="18" /></span>
          <div class="min-w-0 flex-1">
            <p class="shop-card__eyebrow">From</p>
            <p class="shop-card__title">{{ kitchen.name }}</p>
            <p class="shop-card__sub inline-flex items-center gap-1">
              <Icon name="clock" :size="13" />
              ~{{ kitchen.avgPrepMinutes }} min prep · {{ kitchen.district }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <h4 class="m-0 mb-2 text-[15px] font-semibold text-ink">
          {{ tray.count }} {{ tray.count === 1 ? "item" : "items" }}
        </h4>
        <ul class="m-0 list-none p-0 text-[14px] text-ink-soft">
          <li v-for="line in tray.lines" :key="line.lineId" class="flex justify-between gap-3 py-1">
            <span class="truncate">{{ line.quantity }}x {{ line.name }}</span>
            <AppPrice :kobo="lineTotalKobo(line)" size="sm" />
          </li>
        </ul>
      </div>

      <AppFeeSummary
        class="mt-4"
        :subtotal-kobo="quote.subtotalKobo"
        :delivery-fee-kobo="quote.deliveryFeeKobo"
        :service-fee-kobo="quote.serviceFeeKobo"
        :total-kobo="quote.totalKobo"
      >
        <template #note>Prepaid only. Your rider confirms the handoff with a 4-digit code.</template>
      </AppFeeSummary>

      <div class="shop-sticky-footer">
        <AppButton variant="primary" size="lg" block icon="lock" @click="shop.open('payment')">
          Pay {{ formatKobo(quote.totalKobo) }}
        </AppButton>
      </div>
    </template>

    <div v-else class="shop-empty">
      <span class="shop-empty__icon"><Icon name="bag" :size="26" /></span>
      <p class="m-0 text-[15px] font-semibold text-ink">Nothing to check out</p>
      <p class="m-0 text-sm text-ink-muted">Your tray is empty. Pick something from a kitchen first.</p>
      <AppButton variant="secondary" size="sm" class="mt-3" @click="shop.close()">Back to the street</AppButton>
    </div>
  </AppBottomSlider>
</template>

<script setup lang="ts">
import { useShopStore } from "~/stores/shop";
import { useTrayStore, lineTotalKobo } from "~/stores/tray";
import formatKobo from "~/utils/formatKobo";

const shop = useShopStore();
const tray = useTrayStore();
const { homeDistrictName, deliveryFeeKobo, kitchen, quote } = useCheckoutQuote();
</script>
