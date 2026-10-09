import type { Aabb } from "~/utils/types/world";

/**
 * Pushes a circle (x, z, radius) out of any box it overlaps along the axis of
 * least penetration. Boxes are tile footprints, so a handful of checks per
 * step is plenty.
 */
export function pushOut(x: number, z: number, radius: number, boxes: Aabb[]): { x: number; z: number } {
  let px = x;
  let pz = z;
  for (const b of boxes) {
    if (px + radius <= b.minX || px - radius >= b.maxX || pz + radius <= b.minZ || pz - radius >= b.maxZ) continue;
    const left = px + radius - b.minX;
    const right = b.maxX - (px - radius);
    const top = pz + radius - b.minZ;
    const bottom = b.maxZ - (pz - radius);
    const m = Math.min(left, right, top, bottom);
    if (m === left) px = b.minX - radius;
    else if (m === right) px = b.maxX + radius;
    else if (m === top) pz = b.minZ - radius;
    else pz = b.maxZ + radius;
  }
  return { x: px, z: pz };
}

/** Only boxes near a point, so the per-step cost stays tiny. */
export function nearbyBoxes(boxes: Aabb[], x: number, z: number, range: number): Aabb[] {
  return boxes.filter((b) => b.maxX > x - range && b.minX < x + range && b.maxZ > z - range && b.minZ < z + range);
}
