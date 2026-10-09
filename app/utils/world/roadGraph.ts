import type { Tile } from "~/utils/types/world";

/**
 * Which road model and rotation a road tile gets, from the mask of drivable
 * neighbours (N=8, E=4, S=2, W=1). Rotations are multiples of 90 degrees.
 * Kenney's road-straight runs north-south, road-bend opens to the north and
 * east, road-intersection (a T) has its stem to the south, road-end opens to
 * the north. ROAD_BASE_ROT nudges the whole table if the kit's axis differs.
 */
export const ROAD_BASE_ROT = 0;

interface RoadPiece {
  model: string;
  rot: number;
}

const Q = Math.PI / 2;

export const ROAD_BY_MASK: Record<number, RoadPiece> = {
  0: { model: "roads/road-straight", rot: 0 },
  8: { model: "roads/road-end", rot: 0 }, // N only
  4: { model: "roads/road-end", rot: -Q }, // E only
  2: { model: "roads/road-end", rot: Math.PI }, // S only
  1: { model: "roads/road-end", rot: Q }, // W only
  10: { model: "roads/road-straight", rot: 0 }, // N+S
  5: { model: "roads/road-straight", rot: Q }, // E+W
  12: { model: "roads/road-bend", rot: 0 }, // N+E
  6: { model: "roads/road-bend", rot: -Q }, // E+S
  3: { model: "roads/road-bend", rot: Math.PI }, // S+W
  9: { model: "roads/road-bend", rot: Q }, // W+N
  14: { model: "roads/road-intersection", rot: Q }, // N+E+S (missing W): stem E
  7: { model: "roads/road-intersection", rot: Math.PI }, // E+S+W (missing N): stem S
  11: { model: "roads/road-intersection", rot: -Q }, // S+W+N (missing E): stem W
  13: { model: "roads/road-intersection", rot: 0 }, // W+N+E (missing S): stem N
  15: { model: "roads/road-crossroad", rot: 0 },
};

export function roadPieceFor(tile: Tile): RoadPiece {
  const piece = ROAD_BY_MASK[tile.roadMask] ?? ROAD_BY_MASK[0]!;
  return { model: piece.model, rot: piece.rot + ROAD_BASE_ROT };
}
