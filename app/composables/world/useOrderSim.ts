import type { useOrderStore } from "~/stores/order";
import type { useShopStore } from "~/stores/shop";
import type { useWorldStore } from "~/stores/world";
import type { RiderBike } from "~/composables/world/useRiderBike";
import { ACCEPT_MS, START_COOKING_MS, READY_TO_ASSIGN_MS } from "~/utils/constants/simTimings";
import { isTerminalOrderStatus } from "~/utils/constants/orderStatus";

export interface OrderSimHooks {
  setSmoke: (slug: string, on: boolean) => void;
  onDelivered: () => void;
  toast: (message: string) => void;
}

/**
 * Drives the fake order through Foodprint's statuses. Timers compare the
 * clock to the persisted `statusAt` stamps, so a reload resumes with the right
 * time left, and the rider legs are world events rather than timers.
 */
export function useOrderSim(
  order: ReturnType<typeof useOrderStore>,
  shop: ReturnType<typeof useShopStore>,
  world: ReturnType<typeof useWorldStore>,
  van: RiderBike,
  hooks: OrderSimHooks,
) {
  let acc = 0;
  let handoffShownFor: string | null = null;
  let lastCode: string | null = null;

  const since = (status: string) => {
    const at = order.activeOrder?.statusAt[status as keyof typeof order.activeOrder.statusAt];
    return at ? Date.now() - new Date(at).getTime() : 0;
  };

  function onReachedKitchen() {
    if (order.activeOrder?.status === "rider_assigned") {
      order.transition("picked_up");
      order.setRiderPhase("to_home");
      hooks.toast(`${order.activeOrder.riderName} picked up your food`);
    }
  }

  function onReachedHome() {
    if (order.activeOrder?.status === "picked_up") {
      order.setRiderPhase("waiting");
      hooks.toast("Your rider is at your door");
    }
  }

  function onReturned() {
    if (order.activeOrder) order.setRiderPhase(null);
  }

  /** Called once on boot so a persisted order picks up where it left off. */
  function restore() {
    order.validate();
    const o = order.activeOrder;
    if (!o || isTerminalOrderStatus(o.status)) {
      if (o?.riderPhase === "returning") van.restore(o.kitchenSlug, "returning");
      return;
    }
    lastCode = o.code;
    if (o.status === "preparing") hooks.setSmoke(o.kitchenSlug, true);
    if (o.status === "rider_assigned") van.restore(o.kitchenSlug, "to_kitchen");
    if (o.status === "picked_up") van.restore(o.kitchenSlug, o.riderPhase === "waiting" ? "waiting" : "to_home");
  }

  function update(dt: number, playerNearHome: boolean) {
    acc += dt;
    if (acc < 0.25) return;
    acc = 0;
    const o = order.activeOrder;
    if (!o) {
      lastCode = null;
      return;
    }
    if (o.code !== lastCode) {
      lastCode = o.code;
      handoffShownFor = null;
    }

    switch (o.status) {
      case "paid":
        if (since("paid") > ACCEPT_MS) {
          order.transition("accepted");
          hooks.toast(`${o.kitchenName} accepted your order`);
        }
        break;
      case "accepted":
        if (since("accepted") > START_COOKING_MS) {
          order.transition("preparing");
          hooks.setSmoke(o.kitchenSlug, true);
        }
        break;
      case "preparing":
        if (since("preparing") > o.prepMs) {
          order.transition("ready");
          hooks.setSmoke(o.kitchenSlug, false);
        }
        break;
      case "ready":
        if (since("ready") > READY_TO_ASSIGN_MS) {
          order.transition("rider_assigned");
          order.setRiderPhase("to_kitchen");
          van.spawnForOrder(o.kitchenSlug);
          hooks.toast(`${o.riderName} is riding to ${o.kitchenName}`);
        }
        break;
      case "picked_up":
        if (o.riderPhase === "waiting" && playerNearHome && shop.openSheet === null && handoffShownFor !== o.code) {
          handoffShownFor = o.code;
          shop.open("handoff");
        }
        if (o.riderPhase === "waiting" && !playerNearHome) handoffShownFor = null;
        break;
      case "delivered":
        if (o.riderPhase === "returning" && van.currentLeg() === "waiting") van.returnToHub();
        break;
      default:
        break;
    }

    const snap = van.snapshot();
    const prev = world.rider;
    if (!snap) {
      if (prev) world.rider = null;
    } else if (!prev || prev.leg !== snap.leg || Math.abs(prev.progress - snap.progress) > 0.01 || prev.tile.x !== snap.tile.x || prev.tile.y !== snap.tile.y) {
      world.rider = snap;
    }
  }

  /** Hook for the handoff sheet's confirm: play the celebration and send the van home. */
  function onHandoffConfirmed() {
    hooks.setSmoke(order.activeOrder?.kitchenSlug ?? "", false);
    hooks.onDelivered();
    van.returnToHub();
  }

  return { update, restore, onReachedKitchen, onReachedHome, onReturned, onHandoffConfirmed };
}
