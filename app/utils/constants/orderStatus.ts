import type { OrderStatus } from "~/utils/types/order";
import type { BadgeTone } from "~/utils/types/ui";

/**
 * The order state machine, as a map of legal edges. This is the *client* mirror
 * of the server's; the server re-derives it from this same file (invariant #2 —
 * a transition is only ever performed by a Nitro route), so the two can never
 * drift into disagreeing about what an order is allowed to do next.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["rider_assigned", "cancelled"],
  /* `ready` is the only backward edge in the machine. A rider who drops a
     delivery before collecting the food has changed nothing about the order
     except that nobody is carrying it — so it returns to the pool and is
     re-offered. After pickup there is no way back: the food is with a rider,
     and that is an incident for a human, not a state transition. */
  rider_assigned: ["picked_up", "ready", "cancelled"],
  picked_up: ["delivered", "cancelled"],
  delivered: [],
  /* A cancelled order that was paid for still owes the customer their money. */
  cancelled: ["refunded"],
  refunded: [],
};

/**
 * How long an order may sit before it counts as "running late" for its stage.
 * `paid` (the kitchen hasn't accepted) is the window the customer's self-serve
 * "Cancel & get a refund" button waits out — and the same window the cancel
 * route enforces server-side, so the button the customer sees and the guard the
 * server applies can never drift.
 */
export const OVERDUE_PAID_MIN = 12; // the kitchen hasn't accepted a paid order
export const OVERDUE_TOTAL_MIN = 60; // in progress, but far longer than any Awka trip

/**
 * The unaccepted-order ladder, in strictly increasing minutes:
 * re-ping 5 < ops stuck-alert 10 (cron file) < customer cancel 12 (above) <
 * auto-cancel 20. Keep the ordering — each rung assumes the previous one has
 * already fired, and the tracking page quotes the 20-minute promise verbatim.
 */
export const REPING_UNACCEPTED_MIN = 5; // vendor re-ping (WhatsApp + push), once
export const AUTO_CANCEL_UNACCEPTED_MIN = 20; // the sweep cancels + refunds

/** How far past `expected_ready_at` a `preparing` order may run before ops hears. */
export const PREPARING_LATE_GRACE_MIN = 10;
/** The increments a kitchen may add with its once-per-order "running behind". */
export const DELAY_MINUTE_OPTIONS = [5, 10, 15, 20] as const;
/** `expected_ready_at` fallback when a vendor never set `avg_prep_minutes`. */
export const DEFAULT_PREP_MINUTES = 30;

/**
 * How long the rider search may run before the tracking page admits it out
 * loud. Dispatch starts the moment the kitchen accepts, so an order that is
 * accepted/preparing/ready with no rider bound after this many minutes shows
 * "Taking longer than usual — we're on it". The customer is told *that* it is
 * slow, never *why* — individual decline reasons are ops data, not messaging.
 */
export const RIDER_SEARCH_SLOW_MIN = 10;

/** An order nobody is waiting on any more. */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = [
  "delivered",
  "cancelled",
  "refunded",
];

export const isTerminalOrderStatus = (status: OrderStatus): boolean =>
  TERMINAL_ORDER_STATUSES.includes(status);

/** How the customer is told where their order is. */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: BadgeTone }
> = {
  pending_payment: { label: "Awaiting payment", tone: "neutral" },
  paid: { label: "Confirmed", tone: "primary" },
  accepted: { label: "Accepted", tone: "primary" },
  preparing: { label: "Being cooked", tone: "gold" },
  ready: { label: "Ready", tone: "gold" },
  rider_assigned: { label: "Rider assigned", tone: "primary" },
  picked_up: { label: "On the way", tone: "primary" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
};

/**
 * The same statuses in the kitchen's vocabulary. A `paid` order is not
 * "confirmed" to a vendor — it is a bell ringing.
 */
export const VENDOR_ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: BadgeTone }
> = {
  ...ORDER_STATUS_META,
  paid: { label: "New order", tone: "danger" },
  accepted: { label: "Accepted", tone: "primary" },
  preparing: { label: "Preparing", tone: "gold" },
  ready: { label: "Awaiting rider", tone: "gold" },
  picked_up: { label: "Collected", tone: "primary" },
};

/**
 * The tracking timeline. Every stage is a status an order really passes
 * through, so the tracker's index is a lookup rather than a guess.
 */
export const TRACKER_STAGES: readonly { status: OrderStatus; label: string }[] = [
  { status: "paid", label: "Order placed" },
  { status: "accepted", label: "Kitchen accepted" },
  { status: "preparing", label: "Being cooked" },
  { status: "ready", label: "Ready for pickup" },
  { status: "rider_assigned", label: "Rider assigned" },
  { status: "picked_up", label: "On the way" },
  { status: "delivered", label: "Delivered" },
];

/**
 * Which stage the tracker is showing. `pending_payment` sits before the first
 * stage; a cancelled order has left the timeline entirely and the caller should
 * render the cancellation instead of a frozen tracker.
 */
export const trackerIndexFor = (status: OrderStatus): number =>
  TRACKER_STAGES.findIndex((stage) => stage.status === status);

/**
 * Neutral, role-free words for a status, for sentences that both a vendor and a
 * customer might read — chiefly the state machine's own 409s. `ORDER_STATUS_META`
 * speaks to the customer ("Confirmed") and `VENDOR_ORDER_STATUS_META` to the
 * kitchen ("New order"); neither belongs in an error the other one might see.
 */
export const ORDER_STATUS_PLAIN: Record<OrderStatus, string> = {
  pending_payment: "awaiting payment",
  paid: "paid and waiting to be accepted",
  accepted: "accepted",
  preparing: "being cooked",
  ready: "ready for pickup",
  rider_assigned: "assigned to a rider",
  picked_up: "with the rider",
  delivered: "delivered",
  cancelled: "cancelled",
  refunded: "refunded",
};

/** The line under the status badge — what is actually happening right now. */
export const ORDER_STATUS_HINT: Record<OrderStatus, string> = {
  pending_payment: "We haven't received your payment yet.",
  paid: "Waiting for the kitchen to accept your order.",
  accepted: "The kitchen has your order and is starting on it.",
  preparing: "Your food is being cooked right now.",
  ready: "Your food is packed. We're getting a rider to it.",
  rider_assigned: "A rider is on the way to collect your food.",
  picked_up: "Your rider has your food and is heading to you.",
  delivered: "Delivered. We hope it was good.",
  cancelled: "This order was cancelled.",
  refunded: "This order was cancelled and your money is on its way back.",
};
