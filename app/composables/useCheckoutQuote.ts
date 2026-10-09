import { storeToRefs } from "pinia";
import { useTrayStore } from "~/stores/tray";
import { quoteFees } from "~/utils/constants/fees";
import { DISTRICT_BY_NAME } from "~/utils/data/districts";
import { KITCHEN_BY_SLUG } from "~/utils/data/kitchens";
import { HOME, districtAt } from "~/utils/world/tileMap";

/**
 * The checkout numbers, derived once so the checkout sheet and the payment
 * modal can never disagree about what is being paid. Delivery is always to the
 * player's home, so the fee is the home district's.
 */
export default function useCheckoutQuote() {
  const tray = useTrayStore();
  const { subtotalKobo, kitchenSlug } = storeToRefs(tray);

  const homeDistrictName = districtAt(HOME.x, HOME.y) ?? "Awka";
  const homeDistrict = DISTRICT_BY_NAME[homeDistrictName] ?? null;
  const deliveryFeeKobo = homeDistrict?.deliveryFeeKobo ?? 0;

  const kitchen = computed(() => (kitchenSlug.value ? KITCHEN_BY_SLUG[kitchenSlug.value] ?? null : null));
  const quote = computed(() => quoteFees(subtotalKobo.value, deliveryFeeKobo));

  return { homeDistrictName, homeDistrict, deliveryFeeKobo, kitchen, quote };
}
