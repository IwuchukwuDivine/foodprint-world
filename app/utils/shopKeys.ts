import type { InjectionKey } from "vue";
import type { TrayAddition } from "~/stores/tray";

/**
 * ShopRoot provides this. Sheets call it instead of `tray.add()` directly so the
 * one-kitchen-per-tray conflict is asked about in exactly one place.
 */
export const REQUEST_ADD_KEY: InjectionKey<(addition: TrayAddition) => void> = Symbol("shop-request-add");
