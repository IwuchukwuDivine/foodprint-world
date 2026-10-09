/**
 * Mirrors Foodprint's `order_status` enum. The simulation moves between these
 * through the same ORDER_TRANSITIONS table the real app uses, so the world can
 * never show a status the product does not have.
 */
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "accepted"
  | "preparing"
  | "ready"
  | "rider_assigned"
  | "picked_up"
  | "delivered"
  | "cancelled"
  | "refunded";

/** A frozen order line, as the receipt renders it. */
export interface OrderLine {
  name: string;
  quantity: number;
  unitPriceKobo: number;
  lineTotalKobo: number;
  options: { name: string; priceDeltaKobo: number }[];
}
