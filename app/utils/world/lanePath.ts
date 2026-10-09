import type { Vec2 } from "~/utils/types/world";
import { TILE } from "~/utils/world/tileMap";

export interface P2 {
  x: number;
  z: number;
}

/** Right-hand lane offset from the road centre, in world units. */
export const LANE_OFFSET = TILE * 0.22;

/**
 * Tile path to a drivable polyline: shifted into the right-hand lane, with
 * corners rounded by a short quadratic curve so vehicles turn instead of
 * snapping.
 */
export function buildLanePath(tiles: Vec2[], laneOffset = LANE_OFFSET): P2[] {
  const centres: P2[] = tiles.map((t) => ({ x: t.x * TILE, z: t.y * TILE }));
  if (centres.length < 2) return centres;

  // Offset each vertex by the average of its adjacent segments' right-hand normals.
  const offset: P2[] = centres.map((c, i) => {
    const prev = centres[Math.max(0, i - 1)]!;
    const next = centres[Math.min(centres.length - 1, i + 1)]!;
    const d1 = i === 0 ? dir(prev, next) : dir(prev, c);
    const d2 = i === centres.length - 1 ? dir(prev, next) : dir(c, next);
    // right of heading (dx, dz) is (-dz, dx)
    const n1 = { x: -d1.z, z: d1.x };
    const n2 = { x: -d2.z, z: d2.x };
    let nx = n1.x + n2.x;
    let nz = n1.z + n2.z;
    const len = Math.hypot(nx, nz);
    if (len < 1e-4) {
      nx = n1.x;
      nz = n1.z;
    } else {
      // Mitre: keep the lane width constant through the corner.
      const cosHalf = len / 2;
      const k = Math.min(1.6, 1 / Math.max(cosHalf, 0.5));
      nx = (nx / len) * k;
      nz = (nz / len) * k;
    }
    return { x: c.x + nx * laneOffset, z: c.z + nz * laneOffset };
  });

  // Round corners.
  const out: P2[] = [offset[0]!];
  for (let i = 1; i < offset.length - 1; i++) {
    const a = offset[i - 1]!;
    const v = offset[i]!;
    const b = offset[i + 1]!;
    const d1 = dir(a, v);
    const d2 = dir(v, b);
    const turning = Math.abs(d1.x * d2.x + d1.z * d2.z) < 0.95;
    if (!turning) {
      out.push(v);
      continue;
    }
    const r = TILE * 0.42;
    const p0 = { x: v.x - d1.x * r, z: v.z - d1.z * r };
    const p2 = { x: v.x + d2.x * r, z: v.z + d2.z * r };
    out.push(p0);
    for (const t of [0.3, 0.55, 0.78]) {
      const mt = 1 - t;
      out.push({
        x: mt * mt * p0.x + 2 * mt * t * v.x + t * t * p2.x,
        z: mt * mt * p0.z + 2 * mt * t * v.z + t * t * p2.z,
      });
    }
    out.push(p2);
  }
  out.push(offset[offset.length - 1]!);
  return out;
}

function dir(a: P2, b: P2): P2 {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: dx / len, z: dz / len };
}
