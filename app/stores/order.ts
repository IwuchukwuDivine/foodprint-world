import { defineStore } from "pinia";
import type { OrderLine, OrderStatus } from "~/utils/types/order";
import type { TrayLine } from "~/utils/types/shop";
import { ORDER_TRANSITIONS, isTerminalOrderStatus } from "~/utils/constants/orderStatus";
import { lineUnitKobo } from "~/stores/tray";
import { generateOtp, generateOrderCode } from "~/utils/world/otp";
import { prepMsFor, RIDER_NAMES } from "~/utils/constants/simTimings";
import type { RiderLeg } from "~/stores/world";

export interface OrderRating {
  kitchen: number;
  rider: number;
  comment: string;
}

export interface WorldOrder {
  code: string;
  kitchenSlug: string;
  kitchenName: string;
  lines: OrderLine[];
  subtotalKobo: number;
  deliveryFeeKobo: number;
  serviceFeeKobo: number;
  totalKobo: number;
  /** Where it is delivered: the home's district. */
  districtName: string;
  status: OrderStatus;
  /** ISO timestamps, one per status reached. The simulation times itself off these. */
  statusAt: Partial<Record<OrderStatus, string>>;
  prepMs: number;
  riderPhase: RiderLeg | null;
  riderName: string;
  otp: string;
  rating: OrderRating | null;
  createdAt: string;
}

/**
 * The fake order and its history. Status moves only through `transition()`,
 * which checks Foodprint's ORDER_TRANSITIONS, so the world can never show a
 * move the real product forbids. Persisted so a reload resumes mid-delivery.
 */
export const useOrderStore = defineStore(
  "order",
  () => {
    const activeOrder = ref<WorldOrder | null>(null);
    const history = ref<WorldOrder[]>([]);

    const isActive = computed(() => activeOrder.value !== null && !isTerminalOrderStatus(activeOrder.value.status));

    function place(input: {
      kitchenSlug: string;
      kitchenName: string;
      prepMinutes: number;
      lines: TrayLine[];
      deliveryFeeKobo: number;
      serviceFeeKobo: number;
      districtName: string;
    }): WorldOrder {
      const lines: OrderLine[] = input.lines.map((line) => ({
        name: line.name,
        quantity: line.quantity,
        unitPriceKobo: line.unitPriceKobo,
        lineTotalKobo: lineUnitKobo(line) * line.quantity,
        options: line.options.map((o) => ({
          name: o.quantity > 1 ? `${o.quantity}x ${o.name}` : o.name,
          priceDeltaKobo: o.priceDeltaKobo * o.quantity,
        })),
      }));
      const subtotalKobo = lines.reduce((sum, l) => sum + l.lineTotalKobo, 0);
      const now = new Date().toISOString();
      const order: WorldOrder = {
        code: generateOrderCode(),
        kitchenSlug: input.kitchenSlug,
        kitchenName: input.kitchenName,
        lines,
        subtotalKobo,
        deliveryFeeKobo: input.deliveryFeeKobo,
        serviceFeeKobo: input.serviceFeeKobo,
        totalKobo: subtotalKobo + input.deliveryFeeKobo + input.serviceFeeKobo,
        districtName: input.districtName,
        status: "paid",
        statusAt: { pending_payment: now, paid: now },
        prepMs: prepMsFor(input.prepMinutes),
        riderPhase: null,
        riderName: RIDER_NAMES[Math.floor(Math.random() * RIDER_NAMES.length)]!,
        otp: generateOtp(),
        rating: null,
        createdAt: now,
      };
      activeOrder.value = order;
      return order;
    }

    /** Moves the active order, refusing any edge Foodprint's table forbids. */
    function transition(next: OrderStatus): boolean {
      const order = activeOrder.value;
      if (!order) return false;
      const allowed = ORDER_TRANSITIONS[order.status] ?? [];
      if (!allowed.includes(next)) return false;
      order.status = next;
      order.statusAt[next] = new Date().toISOString();
      if (isTerminalOrderStatus(next)) {
        history.value = [order, ...history.value].slice(0, 20);
      }
      return true;
    }

    function setRiderPhase(phase: RiderLeg | null) {
      if (activeOrder.value) activeOrder.value.riderPhase = phase;
    }

    /** The OTP handoff: picked_up to delivered. */
    function confirmHandoff(): boolean {
      const ok = transition("delivered");
      if (ok) setRiderPhase("returning");
      return ok;
    }

    function rate(rating: OrderRating) {
      const order = activeOrder.value;
      if (!order) return;
      order.rating = rating;
      const inHistory = history.value.find((o) => o.code === order.code);
      if (inHistory) inHistory.rating = rating;
    }

    /** Clears a finished order from the active slot. History keeps it. */
    function dismiss() {
      if (activeOrder.value && isTerminalOrderStatus(activeOrder.value.status)) activeOrder.value = null;
    }

    function cancel() {
      transition("cancelled");
    }

    /** Guards against a corrupt persisted order. */
    function validate() {
      const order = activeOrder.value;
      if (!order) return;
      if (!order.code || !order.statusAt || !order.statusAt[order.status] || !order.kitchenSlug) {
        activeOrder.value = null;
      }
    }

    return { activeOrder, history, isActive, place, transition, setRiderPhase, confirmHandoff, rate, dismiss, cancel, validate };
  },
  {
    persist: { storage: piniaPluginPersistedstate.localStorage(), pick: ["activeOrder", "history"] },
  },
);
