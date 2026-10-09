import type { Dir, Tile, Vec2 } from "~/utils/types/world";
import { GRID_SIZE, TILE, DIRS, buildTiles } from "~/utils/world/tileMap";

export const tileKey = (x: number, y: number) => `${x},${y}`;

/** Grid helpers over the flat tile array. Pure and cheap to call per frame. */
export class Grid {
  readonly size = GRID_SIZE;
  readonly tiles: Tile[];

  constructor(tiles: Tile[] = buildTiles()) {
    this.tiles = tiles;
  }

  inBounds(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  at(x: number, y: number): Tile | null {
    return this.inBounds(x, y) ? this.tiles[y * this.size + x]! : null;
  }

  isWalkable(x: number, y: number) {
    return this.at(x, y)?.walkable ?? false;
  }

  isDrivable(x: number, y: number) {
    return this.at(x, y)?.drivable ?? false;
  }

  neighbour(tile: Vec2, dir: Dir): Tile | null {
    return this.at(tile.x + DIRS[dir].x, tile.y + DIRS[dir].y);
  }

  /** 4-connected neighbours that pass the filter. */
  neighbours(tile: Vec2, filter: (t: Tile) => boolean): Tile[] {
    const out: Tile[] = [];
    for (const d of ["N", "E", "S", "W"] as Dir[]) {
      const n = this.neighbour(tile, d);
      if (n && filter(n)) out.push(n);
    }
    return out;
  }

  districtAt(x: number, y: number): string | null {
    return this.at(x, y)?.district ?? null;
  }

  /** The road tile a blocked tile's door opens onto, or null. */
  doorRoad(tile: Tile): Tile | null {
    if (!tile.door) return null;
    return this.neighbour(tile, tile.door);
  }

  /** World-space centre of a tile. */
  static toWorld(tile: Vec2): { x: number; z: number } {
    return { x: tile.x * TILE, z: tile.y * TILE };
  }

  /** The tile containing a world point. */
  static toTile(x: number, z: number): Vec2 {
    return { x: Math.round(x / TILE), y: Math.round(z / TILE) };
  }

  /** The nearest tile matching the filter, by Manhattan distance; null if none. */
  nearest(from: Vec2, filter: (t: Tile) => boolean, maxRadius = 6): Tile | null {
    let best: Tile | null = null;
    let bestD = Infinity;
    for (let r = 0; r <= maxRadius && best === null; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const t = this.at(from.x + dx, from.y + dy);
          if (!t || !filter(t)) continue;
          const d = Math.abs(dx) + Math.abs(dy);
          if (d < bestD) {
            bestD = d;
            best = t;
          }
        }
      }
    }
    return best;
  }
}
