import type { Dir, KitchenPlacement, LandmarkDef, Tile, TileKind, Vec2 } from "~/utils/types/world";

/**
 * The hand-authored map of Awka. Not a survey: a stylised grid where every
 * district, landmark and kitchen sits roughly where it does in the real city.
 * Roads are drawn as lines, every tile touching a road becomes a plot, and
 * the named placements below override individual tiles.
 */
export const GRID_SIZE = 28;

/** One Kenney tile (1 model unit) is this many world units. */
export const TILE = 4;

const ROAD_XS = [1, 6, 10, 14, 18, 22, 26];
const ROAD_YS = [1, 6, 10, 14, 18, 22, 26];

/** Roundabout centres; each covers a 3x3 block. */
export const ROUNDABOUTS: Vec2[] = [
  { x: 14, y: 14 }, // Aroma Junction
  { x: 14, y: 22 }, // Amawbia
];

export interface DistrictRect {
  name: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const DISTRICT_RECTS: DistrictRect[] = [
  { name: "Udoka Estate", x0: 0, y0: 0, x1: 9, y1: 9 },
  { name: "Unizik Temp Site", x0: 10, y0: 0, x1: 17, y1: 9 },
  { name: "Ifite", x0: 18, y0: 0, x1: 27, y1: 9 },
  { name: "Eke Awka", x0: 0, y0: 10, x1: 9, y1: 17 },
  { name: "Aroma", x0: 10, y0: 10, x1: 17, y1: 17 },
  { name: "Agu Awka (GRA)", x0: 18, y0: 10, x1: 27, y1: 27 },
  { name: "Okpuno", x0: 0, y0: 18, x1: 9, y1: 27 },
  { name: "Amawbia", x0: 10, y0: 18, x1: 17, y1: 27 },
];

export const KITCHEN_PLACEMENTS: KitchenPlacement[] = [
  { slug: "mama-nkechis-kitchen", x: 23, y: 5 },
  { slug: "awka-jollof-republic", x: 12, y: 11 },
  { slug: "suya-spot-ifite", x: 24, y: 9 },
  { slug: "crispy-crown-chicken", x: 7, y: 11 },
  { slug: "napoli-pizza-pasta", x: 7, y: 7 },
  { slug: "shawarma-king-aroma", x: 17, y: 15 },
  { slug: "sweet-tooth-patisserie", x: 23, y: 13 },
  { slug: "fresh-blend-juice-bar", x: 12, y: 5 },
  { slug: "sunrise-breakfast-cafe", x: 7, y: 21 },
  { slug: "green-bowl", x: 20, y: 19 },
  { slug: "ocean-basket-awka", x: 11, y: 25 },
  { slug: "chop-chop-small-chops", x: 3, y: 15 },
];

/** The player's house. */
export const HOME: Vec2 = { x: 3, y: 7 };

/** Where riders wait between deliveries. */
export const RIDER_HUB: Vec2 = { x: 12, y: 17 };

export const LANDMARKS: LandmarkDef[] = [
  { id: "unizik-gate", name: "Unizik Main Gate", x: 20, y: 7, w: 2, h: 2, district: "Ifite" },
  { id: "eke-awka-market", name: "Eke Awka Market", x: 7, y: 15, w: 2, h: 2, district: "Eke Awka" },
  { id: "ekwueme-square", name: "Ekwueme Square", x: 2, y: 11, w: 2, h: 2, district: "Eke Awka" },
  { id: "government-house", name: "Government House", x: 24, y: 19, w: 2, h: 2, district: "Agu Awka (GRA)" },
  { id: "temp-site-campus", name: "Unizik Temp Site", x: 15, y: 2, w: 2, h: 2, district: "Unizik Temp Site" },
];

const DIRS: Record<Dir, Vec2> = { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } };
const DIR_BITS: Record<Dir, number> = { N: 8, E: 4, S: 2, W: 1 };

export function districtAt(x: number, y: number): string | null {
  const rect = DISTRICT_RECTS.find((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);
  return rect?.name ?? null;
}

const inRoundabout = (x: number, y: number): "centre" | "ring" | null => {
  for (const r of ROUNDABOUTS) {
    const dx = Math.abs(x - r.x);
    const dy = Math.abs(y - r.y);
    if (dx === 0 && dy === 0) return "centre";
    if (dx <= 1 && dy <= 1) return "ring";
  }
  return null;
};

const isRoadLine = (x: number, y: number) =>
  (ROAD_XS.includes(x) && y >= 1 && y <= 26) || (ROAD_YS.includes(y) && x >= 1 && x <= 26);

/** Builds the full tile grid. Index = y * GRID_SIZE + x. */
export function buildTiles(): Tile[] {
  const tiles: Tile[] = [];
  const kindAt: TileKind[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const round = inRoundabout(x, y);
      let kind: TileKind;
      if (round === "centre") kind = "roundabout";
      else if (round === "ring") kind = "ring";
      else if (isRoadLine(x, y)) kind = "road";
      else if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) kind = "edge";
      else kind = "yard";
      kindAt.push(kind);
    }
  }

  const drivable = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;
    const k = kindAt[y * GRID_SIZE + x]!;
    return k === "road" || k === "ring";
  };

  // Every yard tile touching a road becomes a plot facing that road.
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (kindAt[y * GRID_SIZE + x] !== "yard") continue;
      if ((["S", "N", "E", "W"] as Dir[]).some((d) => drivable(x + DIRS[d].x, y + DIRS[d].y))) {
        kindAt[y * GRID_SIZE + x] = "plot";
      }
    }
  }

  const overrides = new Map<string, { kind: TileKind; ref: string | null }>();
  for (const k of KITCHEN_PLACEMENTS) overrides.set(`${k.x},${k.y}`, { kind: "kitchen", ref: k.slug });
  overrides.set(`${HOME.x},${HOME.y}`, { kind: "home", ref: "home" });
  overrides.set(`${RIDER_HUB.x},${RIDER_HUB.y}`, { kind: "hub", ref: "hub" });
  for (const l of LANDMARKS) {
    for (let dy = 0; dy < l.h; dy++) {
      for (let dx = 0; dx < l.w; dx++) overrides.set(`${l.x + dx},${l.y + dy}`, { kind: "landmark", ref: l.id });
    }
  }

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const override = overrides.get(`${x},${y}`);
      const kind = override?.kind ?? kindAt[y * GRID_SIZE + x]!;
      const isDrivable = kind === "road" || kind === "ring";
      let mask = 0;
      if (isDrivable) {
        for (const d of ["N", "E", "S", "W"] as Dir[]) {
          if (drivable(x + DIRS[d].x, y + DIRS[d].y)) mask |= DIR_BITS[d];
        }
      }
      let door: Dir | null = null;
      if (kind === "kitchen" || kind === "home" || kind === "plot" || kind === "hub" || kind === "landmark") {
        for (const d of ["S", "N", "W", "E"] as Dir[]) {
          if (drivable(x + DIRS[d].x, y + DIRS[d].y)) {
            door = d;
            break;
          }
        }
      }
      const blocked = kind === "plot" || kind === "kitchen" || kind === "home" || kind === "roundabout" || kind === "landmark";
      tiles.push({
        x,
        y,
        kind,
        walkable: !blocked,
        drivable: isDrivable,
        district: districtAt(x, y),
        roadMask: mask,
        door,
        ref: override?.ref ?? null,
      });
    }
  }
  return tiles;
}

/** The map as text, for debugging in a console. */
export function renderAscii(tiles: Tile[]): string {
  const glyph: Record<TileKind, string> = {
    road: "#",
    ring: "o",
    roundabout: "O",
    plot: "s",
    yard: ".",
    edge: "~",
    kitchen: "K",
    home: "H",
    landmark: "L",
    hub: "X",
  };
  const rows: string[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    rows.push(tiles.slice(y * GRID_SIZE, (y + 1) * GRID_SIZE).map((t) => glyph[t.kind]).join(""));
  }
  return rows.join("\n");
}

export { DIRS, DIR_BITS };
