import { defineStore } from "pinia";
import type { TrayLine } from "~/utils/types/shop";

/** What a caller hands `add()`: the line minus the id we derive for it. */
export type TrayAddition = Omit<TrayLine, "lineId">;

/**
 * Two additions of the same dish with the same options at the same quantities
 * are the same line, so the tray shows "2x Jollof (extra meat)" rather than two
 * identical rows. Option ids are sorted first: tap order is not a choice.
 */
const lineIdFor = (addition: TrayAddition): string =>
  [
    addition.itemId,
    ...addition.options.map((option) => `${option.id}x${option.quantity}`).sort(),
  ].join(":");

/** Base price plus every chosen option at its quantity, for one unit. */
export const lineUnitKobo = (line: TrayLine): number =>
  line.unitPriceKobo
  + line.options.reduce((sum, option) => sum + option.priceDeltaKobo * option.quantity, 0);

export const lineTotalKobo = (line: TrayLine): number => lineUnitKobo(line) * line.quantity;

/**
 * The tray. Persisted to localStorage so it survives a reload. One kitchen per
 * tray; the first line decides which, and a second kitchen asks first.
 */
export const useTrayStore = defineStore(
  "tray",
  () => {
    const lines = ref<TrayLine[]>([]);

    const kitchenSlug = computed(() => lines.value[0]?.kitchenSlug ?? null);
    const kitchenName = computed(() => lines.value[0]?.kitchenName ?? "");

    const isEmpty = computed(() => lines.value.length === 0);
    const count = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0));
    const subtotalKobo = computed(() =>
      lines.value.reduce((sum, line) => sum + lineTotalKobo(line), 0),
    );

    /** True when adding this kitchen's food would mean abandoning another tray. */
    const conflictsWith = (candidateSlug: string): boolean =>
      !isEmpty.value && kitchenSlug.value !== candidateSlug;

    /** How many of a given dish are in the tray, across all option sets. */
    const quantityOfItem = (itemId: string): number =>
      lines.value
        .filter((line) => line.itemId === itemId)
        .reduce((sum, line) => sum + line.quantity, 0);

    function add(addition: TrayAddition) {
      const lineId = lineIdFor(addition);
      const existing = lines.value.find((line) => line.lineId === lineId);
      if (existing) {
        existing.quantity += addition.quantity;
        return;
      }
      lines.value.push({ ...addition, lineId });
    }

    /** Empties the tray, then adds: the "start a new tray" branch of the conflict. */
    function replaceWith(addition: TrayAddition) {
      lines.value = [];
      add(addition);
    }

    function setQuantity(lineId: string, quantity: number) {
      const line = lines.value.find((candidate) => candidate.lineId === lineId);
      if (!line) return;
      if (quantity <= 0) {
        remove(lineId);
        return;
      }
      line.quantity = quantity;
    }

    function remove(lineId: string) {
      lines.value = lines.value.filter((line) => line.lineId !== lineId);
    }

    function clear() {
      lines.value = [];
    }

    return {
      lines,
      kitchenSlug,
      kitchenName,
      isEmpty,
      count,
      subtotalKobo,
      conflictsWith,
      quantityOfItem,
      add,
      replaceWith,
      setQuantity,
      remove,
      clear,
    };
  },
  {
    persist: { storage: piniaPluginPersistedstate.localStorage(), pick: ["lines"] },
  },
);
