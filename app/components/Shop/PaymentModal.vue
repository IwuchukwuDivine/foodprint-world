<template>
  <AppModal :model-value="true" size="sm" persistent role="customer">
    <template #title>
      <span class="inline-flex items-center gap-2">
        <span class="grid h-8 w-8 place-items-center rounded-full bg-success/15 text-success">
          <Icon name="lock" :size="15" />
        </span>
        Secure checkout
      </span>
    </template>

    <div v-if="state !== 'done'" class="flex flex-col gap-4">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="shop-card__eyebrow">Amount</p>
          <AppPrice :kobo="amountKobo" size="lg" />
        </div>
        <AppBadge tone="gold" label="Test mode" icon="info" />
      </div>

      <div class="payment-card" aria-disabled="true">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-mist text-ink-muted">
          <Icon name="card" :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-[14.5px] font-semibold text-ink-soft">Card ending 4081</p>
          <p class="m-0 text-[12.5px] text-ink-muted">Demo card. No real money moves.</p>
        </div>
        <Icon name="check" :size="16" class="text-success" />
      </div>

      <AppButton variant="primary" size="lg" block :loading="state === 'paying'" @click="pay">
        Pay {{ formatKobo(amountKobo) }}
      </AppButton>
      <AppButton
        variant="ghost"
        size="sm"
        block
        :disabled="state === 'paying'"
        @click="shop.open('checkout')"
      >
        Back to checkout
      </AppButton>
    </div>

    <div v-else class="flex flex-col items-center gap-2 py-2 text-center">
      <span class="payment-success">
        <Icon name="check" :size="30" />
      </span>
      <p class="m-0 mt-2 text-[18px] font-semibold text-ink">Payment successful</p>
      <p class="m-0 text-sm text-ink-muted">Order <b class="text-ink">{{ placedCode }}</b> is with the kitchen.</p>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { useOrderStore } from "~/stores/order";
import { useShopStore } from "~/stores/shop";
import { useTrayStore } from "~/stores/tray";
import formatKobo from "~/utils/formatKobo";

/**
 * A Paystack-shaped step that is visibly fake: no card inputs anywhere, a
 * "Test mode" badge, a demo card row. Success places the order and clears the
 * tray; the engine takes it from there.
 */
const shop = useShopStore();
const tray = useTrayStore();
const order = useOrderStore();
const toast = useToast();
const { homeDistrictName, deliveryFeeKobo, kitchen, quote } = useCheckoutQuote();

const state = ref<"idle" | "paying" | "done">("idle");
/* Frozen at pay time: the tray empties on success and the quote would go to zero. */
const amountKobo = ref(quote.value.totalKobo);
const placedCode = ref("");

let payTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function pay() {
  if (state.value !== "idle") return;
  const currentKitchen = kitchen.value;
  if (!currentKitchen || tray.isEmpty) {
    toast.error("Your tray is empty");
    shop.open("tray");
    return;
  }
  state.value = "paying";
  amountKobo.value = quote.value.totalKobo;

  payTimer = setTimeout(() => {
    const placed = order.place({
      kitchenSlug: currentKitchen.slug,
      kitchenName: currentKitchen.name,
      prepMinutes: currentKitchen.avgPrepMinutes,
      lines: tray.lines.map((line) => ({ ...line, options: line.options.map((o) => ({ ...o })) })),
      deliveryFeeKobo,
      serviceFeeKobo: quote.value.serviceFeeKobo,
      districtName: homeDistrictName,
    });
    placedCode.value = placed.code;
    tray.clear();
    state.value = "done";
    toast.success("Order placed. The kitchen has it.");
    closeTimer = setTimeout(() => shop.close(), 900);
  }, 1500);
}

onUnmounted(() => {
  if (payTimer) clearTimeout(payTimer);
  if (closeTimer) clearTimeout(closeTimer);
});
</script>

<style scoped>
.payment-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 14px;
  border: 1.5px solid var(--color-line-soft);
  background: var(--color-surface-alt);
  opacity: 0.85;
}
.payment-success {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-success) 16%, transparent);
  color: var(--color-success);
  animation: payment-pop 0.45s var(--ease-spring) both;
}
@keyframes payment-pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .payment-success {
    animation: none;
  }
}
</style>
