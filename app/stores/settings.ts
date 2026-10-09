import { defineStore } from "pinia";

/** Small per-device preferences. */
export const useSettingsStore = defineStore(
  "settings",
  () => {
    /** null follows real Lagos time; true/false forces night/day. */
    const nightOverride = ref<boolean | null>(null);
    const hasEnteredBefore = ref(false);
    const playerName = ref("You");

    return { nightOverride, hasEnteredBefore, playerName };
  },
  { persist: { storage: piniaPluginPersistedstate.localStorage() } },
);
