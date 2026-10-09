/** How fast the fake order moves. Real Foodprint minutes become seconds here. */
export const ACCEPT_MS = 3000;
export const START_COOKING_MS = 1500;
export const READY_TO_ASSIGN_MS = 1200;
/** Prep minutes scale to a cook time between these bounds. */
export const PREP_MS_PER_MINUTE = 700;
export const PREP_MS_MIN = 18_000;
export const PREP_MS_MAX = 40_000;
/** World units per second. */
export const VAN_SPEED = 9;
export const NPC_CAR_SPEED_MIN = 5.5;
export const NPC_CAR_SPEED_MAX = 8;
/** Seconds the van idles at a door. */
export const VAN_DOOR_PAUSE_S = 1.2;
/** Tiles from the home door within which the handoff can happen. */
export const HANDOFF_RANGE_TILES = 2.5;

export const RIDER_NAMES = ["Ebuka O.", "Chidi N.", "Amara U.", "Ikenna A.", "Nneka E.", "Obinna K."];

export function prepMsFor(prepMinutes: number): number {
  return Math.min(PREP_MS_MAX, Math.max(PREP_MS_MIN, prepMinutes * PREP_MS_PER_MINUTE));
}
