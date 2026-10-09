<template>
  <div class="app-fees" :class="{ 'app-fees--bare': bare }">
    <template v-if="loading">
      <div v-for="n in 3" :key="n" class="app-fees__row">
        <AppSkeleton variant="text" width="38%" height="0.9rem" />
        <AppSkeleton variant="text" width="22%" height="0.9rem" />
      </div>
      <div class="app-fees__rule" />
      <div class="app-fees__row">
        <AppSkeleton variant="text" width="30%" height="1.1rem" />
        <AppSkeleton variant="text" width="32%" height="1.4rem" />
      </div>
    </template>

    <template v-else>
      <div class="app-fees__row">
        <span class="app-fees__label">Subtotal</span>
        <span class="app-fees__value">{{ formatKobo(subtotalKobo) }}</span>
      </div>

      <div class="app-fees__row">
        <span class="app-fees__label">Delivery fee</span>
        <!-- Before an address is picked there is no area, and no area means no
             fee we could honestly name. Say so rather than print a zero. -->
        <span v-if="deliveryFeeKobo === null" class="app-fees__pending">
          At checkout
        </span>
        <span v-else class="app-fees__value">{{ formatKobo(deliveryFeeKobo) }}</span>
      </div>

      <div class="app-fees__row">
        <span class="app-fees__label">Service fee</span>
        <span v-if="serviceFeeKobo === null" class="app-fees__pending">At checkout</span>
        <span v-else class="app-fees__value">{{ formatKobo(serviceFeeKobo) }}</span>
      </div>

      <div v-if="discountKobo > 0" class="app-fees__row">
        <span class="app-fees__label">Discount</span>
        <span class="app-fees__discount">−{{ formatKobo(discountKobo) }}</span>
      </div>

      <div class="app-fees__rule" />

      <div class="app-fees__row app-fees__row--total">
        <span class="app-fees__total-label">{{ totalLabel }}</span>
        <AppPrice v-if="totalKobo !== null" :kobo="totalKobo" size="lg" />
        <span v-else class="app-fees__pending">...</span>
      </div>

      <!-- The wallet is tender, not a discount: the total is unchanged, and
           these two lines say how it's being paid. Rendered only when wallet
           credit is actually applied. -->
      <template v-if="walletAppliedKobo > 0">
        <div class="app-fees__row">
          <span class="app-fees__label">Wallet credit</span>
          <span class="app-fees__discount">−{{ formatKobo(walletAppliedKobo) }}</span>
        </div>
        <div v-if="cardDueKobo !== null && cardDueKobo > 0" class="app-fees__row">
          <span class="app-fees__label">Card payment</span>
          <span class="app-fees__value">{{ formatKobo(cardDueKobo) }}</span>
        </div>
      </template>

      <p v-if="$slots.note" class="app-fees__note">
        <slot name="note" />
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import formatKobo from "~/utils/formatKobo";

/**
 * The order's money, in the vocabulary every surface shares: Subtotal, Delivery
 * fee, Service fee, Discount, Total. Used by the tray, the checkout review step
 * and the payment result — one component, so the four screens can never
 * disagree about what a line is called or how a discount is signed.
 *
 * A `null` fee means "not knowable yet" (no address chosen), which is a
 * different statement from zero and is rendered as such.
 */
withDefaults(
  defineProps<{
    subtotalKobo: number;
    /** null until a delivery area is known. */
    deliveryFeeKobo?: number | null;
    serviceFeeKobo?: number | null;
    discountKobo?: number;
    /** Wallet credit applied as tender (Phase 16) — the total is unchanged;
     * this and cardDueKobo say how it's being paid. */
    walletAppliedKobo?: number;
    /** What the card still owes once the wallet portion is taken off. */
    cardDueKobo?: number | null;
    /** null while the server hasn't priced the order. */
    totalKobo?: number | null;
    totalLabel?: string;
    /** Skeletons while a quote is in flight. */
    loading?: boolean;
    /** Drops the card chrome — for use inside a surface that already has some. */
    bare?: boolean;
  }>(),
  {
    deliveryFeeKobo: null,
    serviceFeeKobo: null,
    discountKobo: 0,
    walletAppliedKobo: 0,
    cardDueKobo: null,
    totalKobo: null,
    totalLabel: "Total",
    loading: false,
    bare: false,
  },
);
</script>

<style scoped>
.app-fees {
  display: flex;
  flex-direction: column;
  gap: 0.6875rem;
  padding: 1rem;
  border: 1.5px solid var(--color-line-soft);
  border-radius: 1rem;
  background: var(--color-surface);
}

.app-fees--bare {
  padding: 0;
  border: none;
  background: transparent;
}

.app-fees__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.app-fees__row--total {
  align-items: baseline;
}

.app-fees__label {
  font-size: 0.875rem;
  color: var(--color-ink-soft);
}

.app-fees__value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
  white-space: nowrap;
}

.app-fees__pending {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink-faint);
  white-space: nowrap;
}

.app-fees__discount {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-success);
  white-space: nowrap;
}

.app-fees__rule {
  height: 1px;
  background: var(--color-line-soft);
}

.app-fees__total-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
}

.app-fees__note {
  margin: 0;
  font-size: 0.78125rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
}
</style>
