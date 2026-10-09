import type { WorldOrder } from "~/stores/order";
import { ORDER_STATUS_PLAIN } from "~/utils/constants/orderStatus";

/** The live ticker line for an order's current status. */
export default function orderTickerLine(order: WorldOrder): string {
  const { code, kitchenName, riderName, status } = order;
  switch (status) {
    case "paid":
      return `Order ${code} sent to ${kitchenName}`;
    case "accepted":
      return `${kitchenName} accepted order ${code}`;
    case "preparing":
      return `Order ${code} is being cooked at ${kitchenName}`;
    case "ready":
      return `Order ${code} is packed at ${kitchenName}, finding a rider`;
    case "rider_assigned":
      return `${riderName} is heading to ${kitchenName} for order ${code}`;
    case "picked_up":
      return `${riderName} has order ${code} and is on the way to you`;
    case "delivered":
      return `Order ${code} delivered. Enjoy your food`;
    default:
      return `Order ${code} is ${ORDER_STATUS_PLAIN[status]}`;
  }
}
