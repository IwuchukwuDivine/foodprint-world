import type { MenuSection } from "~/utils/types/shop";
import { mamaNkechisKitchen } from "~/utils/data/menus/mama-nkechis-kitchen";
import { awkaJollofRepublic } from "~/utils/data/menus/awka-jollof-republic";
import { suyaSpotIfite } from "~/utils/data/menus/suya-spot-ifite";
import { crispyCrownChicken } from "~/utils/data/menus/crispy-crown-chicken";
import { napoliPizzaPasta } from "~/utils/data/menus/napoli-pizza-pasta";
import { shawarmaKingAroma } from "~/utils/data/menus/shawarma-king-aroma";
import { sweetToothPatisserie } from "~/utils/data/menus/sweet-tooth-patisserie";
import { freshBlendJuiceBar } from "~/utils/data/menus/fresh-blend-juice-bar";
import { sunriseBreakfastCafe } from "~/utils/data/menus/sunrise-breakfast-cafe";
import { greenBowl } from "~/utils/data/menus/green-bowl";
import { oceanBasketAwka } from "~/utils/data/menus/ocean-basket-awka";
import { chopChopSmallChops } from "~/utils/data/menus/chop-chop-small-chops";

/** Every kitchen's menu, keyed by kitchen slug. */
export const MENUS: Record<string, MenuSection[]> = {
  "mama-nkechis-kitchen": mamaNkechisKitchen,
  "awka-jollof-republic": awkaJollofRepublic,
  "suya-spot-ifite": suyaSpotIfite,
  "crispy-crown-chicken": crispyCrownChicken,
  "napoli-pizza-pasta": napoliPizzaPasta,
  "shawarma-king-aroma": shawarmaKingAroma,
  "sweet-tooth-patisserie": sweetToothPatisserie,
  "fresh-blend-juice-bar": freshBlendJuiceBar,
  "sunrise-breakfast-cafe": sunriseBreakfastCafe,
  "green-bowl": greenBowl,
  "ocean-basket-awka": oceanBasketAwka,
  "chop-chop-small-chops": chopChopSmallChops,
};

export function menuFor(slug: string): MenuSection[] {
  return MENUS[slug] ?? [];
}
