import type { Dir, Placement, Tile } from "~/utils/types/world";
import type { Grid } from "~/utils/world/grid";
import { TILE, ROUNDABOUTS } from "~/utils/world/tileMap";
import { roadPieceFor } from "~/utils/world/roadGraph";
import { tileNoise, pick } from "~/utils/world/seededRandom";

/** Footprint (x, z) and height of a model in model units, from the loader. */
export type Measure = (key: string) => { w: number; d: number; h: number };

/** A model's front faces +Z; this turns it toward its door. */
export const DOOR_ROT: Record<Dir, number> = {
  S: 0,
  E: Math.PI / 2,
  N: Math.PI,
  W: -Math.PI / 2,
};

const SUBURBAN_POOL = [
  "suburban/building-type-a",
  "suburban/building-type-c",
  "suburban/building-type-e",
  "suburban/building-type-g",
  "suburban/building-type-h",
  "suburban/building-type-i",
  "suburban/building-type-k",
  "suburban/building-type-m",
];

const COMMERCIAL_POOL = [
  "commercial/building-a",
  "commercial/building-b",
  "commercial/building-c",
  "commercial/building-d",
  "commercial/building-e",
  "commercial/building-f",
  "commercial/building-g",
  "commercial/building-h",
];

const TOWER_POOL = [
  "commercial/low-detail-building-a",
  "commercial/low-detail-building-b",
  "commercial/low-detail-building-c",
  "commercial/low-detail-building-g",
  "commercial/low-detail-building-h",
  "commercial/low-detail-building-j",
  "commercial/low-detail-building-m",
  "commercial/low-detail-building-wide-a",
  "commercial/low-detail-building-wide-b",
];

const YARD_POOL = [
  "nature/tree_palm",
  "nature/tree_palmTall",
  "nature/tree_palmBend",
  "nature/tree_default",
  "nature/tree_oak",
  "nature/tree_detailed",
  "nature/plant_bushLarge",
  "nature/tree_palmDetailedShort",
];

const EDGE_POOL = [
  "nature/tree_palm",
  "nature/tree_palmTall",
  "nature/tree_palmDetailedTall",
  "nature/tree_default",
  "nature/tree_oak",
  "nature/tree_palmBend",
];

const BUSH_POOL = ["nature/plant_bush", "nature/plant_bushDetailed", "nature/grass_large", "nature/flower_yellowA", "nature/flower_redA", "nature/flower_purpleA", "nature/rock_smallA", "nature/rock_smallB"];

/** Districts that read as "downtown": commercial fronts with towers behind. */
const COMMERCIAL_DISTRICTS = new Set(["Aroma", "Eke Awka", "Amawbia"]);

/** Warm paint variations for suburban houses. */
const HOUSE_TINTS = [0xffffff, 0xfff1e0, 0xffe9d6, 0xf4f8ff, 0xf6ffef, 0xfff6c9];

function footprintScale(measure: Measure, key: string, maxFootprint: number, base = TILE): number {
  const m = measure(key);
  const widest = Math.max(m.w, m.d);
  return Math.min(base, maxFootprint / widest);
}

/** Centre of a tile in world units. */
const centre = (t: { x: number; y: number }) => ({ x: t.x * TILE, z: t.y * TILE });

export function buildStaticPlacements(grid: Grid, measure: Measure): Placement[] {
  const out: Placement[] = [];
  const roundaboutTiles = new Set(ROUNDABOUTS.flatMap((r) => {
    const keys: string[] = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keys.push(`${r.x + dx},${r.y + dy}`);
    return keys;
  }));

  for (const tile of grid.tiles) {
    const c = centre(tile);
    const n = tileNoise(tile.x, tile.y);
    const n2 = tileNoise(tile.x, tile.y, "b");

    if (tile.kind === "road") {
      const piece = roadPieceFor(tile);
      out.push({ model: piece.model, x: c.x, y: 0, z: c.z, rotY: piece.rot, scale: TILE });
      addStreetFurniture(tile, grid, out, n);
      continue;
    }

    if (tile.kind === "ring" || tile.kind === "roundabout") {
      if (!roundaboutTiles.has(`${tile.x},${tile.y}`)) continue;
      if (tile.kind === "roundabout") {
        out.push({ model: "roads/road-roundabout", x: c.x, y: 0, z: c.z, rotY: 0, scale: TILE });
        out.push({ model: "nature/tree_palmDetailedTall", x: c.x, y: 0.05, z: c.z, rotY: n * 6, scale: TILE * 0.9 });
      }
      continue;
    }

    // Ground under everything that is not a road: a grass tile.
    out.push({ model: "roads/tile-low", x: c.x, y: -0.01, z: c.z, rotY: 0, scale: TILE });

    if (tile.kind === "plot") {
      const downtown = COMMERCIAL_DISTRICTS.has(tile.district ?? "");
      const door = tile.door ?? "S";
      if (downtown) {
        if (n2 < 0.3) {
          const key = pick(TOWER_POOL, n);
          out.push({ model: key, x: c.x, y: 0, z: c.z, rotY: DOOR_ROT[door], scale: footprintScale(measure, key, 3.4, 7) });
        } else {
          const key = pick(COMMERCIAL_POOL, n);
          out.push({ model: key, x: c.x, y: 0, z: c.z, rotY: DOOR_ROT[door], scale: footprintScale(measure, key, 3.6) });
        }
      } else {
        const key = pick(SUBURBAN_POOL, n);
        out.push({
          model: key,
          x: c.x,
          y: 0,
          z: c.z,
          rotY: DOOR_ROT[door],
          scale: footprintScale(measure, key, 3.5),
          tint: pick(HOUSE_TINTS, n2),
        });
      }
      continue;
    }

    if (tile.kind === "yard") {
      const key = pick(YARD_POOL, n);
      out.push({ model: key, x: c.x + (n2 - 0.5) * 1.2, y: 0, z: c.z + (n - 0.5) * 1.2, rotY: n * 6.28, scale: TILE * (0.7 + n2 * 0.4) });
      if (n2 > 0.5) {
        out.push({ model: pick(BUSH_POOL, n2), x: c.x + (n - 0.5) * 2.4, y: 0, z: c.z - (n2 - 0.5) * 2.4, rotY: n2 * 6.28, scale: TILE });
      }
      continue;
    }

    if (tile.kind === "edge") {
      if (n < 0.75) {
        const key = pick(EDGE_POOL, n2);
        out.push({ model: key, x: c.x + (n2 - 0.5) * 2, y: 0, z: c.z + (n - 0.5) * 2, rotY: n * 6.28, scale: TILE * (0.8 + n2 * 0.5) });
      }
      out.push({ model: pick(BUSH_POOL, n), x: c.x - (n - 0.5) * 2.6, y: 0, z: c.z + (n2 - 0.5) * 2.6, rotY: n2 * 6.28, scale: TILE });
      continue;
    }

    if (tile.kind === "hub") {
      out.push({ model: "roads/driveway-short" as string, x: c.x, y: 0, z: c.z, rotY: DOOR_ROT[tile.door ?? "S"], scale: TILE });
    }
  }
  // driveway lives in the suburban pack
  for (const p of out) if (p.model === "roads/driveway-short") p.model = "suburban/driveway-short";
  return out;
}

/** Street lamps on straight roads, every third tile, alternating sides. */
function addStreetFurniture(tile: Tile, grid: Grid, out: Placement[], n: number) {
  const c = centre(tile);
  const straightNS = tile.roadMask === 10;
  const straightEW = tile.roadMask === 5;
  if (straightNS && tile.y % 3 === 0) {
    const side = (tile.y / 3) % 2 === 0 ? 1 : -1;
    out.push({ model: "roads/light-curved", x: c.x + side * TILE * 0.46, y: 0, z: c.z, rotY: side > 0 ? -Math.PI / 2 : Math.PI / 2, scale: TILE });
  } else if (straightEW && tile.x % 3 === 0) {
    const side = (tile.x / 3) % 2 === 0 ? 1 : -1;
    out.push({ model: "roads/light-curved", x: c.x, y: 0, z: c.z + side * TILE * 0.46, rotY: side > 0 ? Math.PI : 0, scale: TILE });
  }
  if ((straightNS || straightEW) && n > 0.93) {
    const d = straightNS ? { x: TILE * 0.42, z: 0 } : { x: 0, z: TILE * 0.42 };
    out.push({ model: "roads/dumpster", x: c.x - d.x, y: 0, z: c.z - d.z, rotY: straightNS ? Math.PI / 2 : 0, scale: TILE * 0.8 });
  }
  void grid;
}
