import { defineStore } from "pinia";

export type RiderLeg = "to_kitchen" | "to_home" | "waiting" | "returning";

/**
 * Reactive snapshots of the running world, written by the loop at ~10 Hz and
 * only when a value changes, so the HUD never sees per-frame churn. Nothing
 * here is persisted.
 */
export const useWorldStore = defineStore("world", () => {
  const loading = ref({ progress: 0, ready: false, entered: false, failed: false });
  const playerTile = ref({ x: 0, y: 0 });
  const district = ref<string | null>(null);
  /** The kitchen whose door the player is standing at, if any. */
  const nearbyKitchen = ref<string | null>(null);
  /** The kitchen the player is auto-walking to, if any. */
  const walkingTo = ref<string | null>(null);
  /** The order's van: which leg, how far along it (0..1), and where it is. */
  const rider = ref<{ leg: RiderLeg; progress: number; tile: { x: number; y: number } } | null>(null);
  const playerNearHome = ref(false);
  const isNight = ref(false);
  const clock = ref("--:--");
  const fps = ref(0);
  const drawCalls = ref(0);
  const followingRider = ref(false);

  return {
    loading,
    playerTile,
    district,
    nearbyKitchen,
    walkingTo,
    rider,
    playerNearHome,
    isNight,
    clock,
    fps,
    drawCalls,
    followingRider,
  };
});
