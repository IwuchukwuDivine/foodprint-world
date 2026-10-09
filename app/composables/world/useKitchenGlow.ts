import type * as THREE from "three";
import type { City } from "~/composables/world/useCityBuilder";
import { setEmissive } from "~/utils/world/materials";
import { TILE } from "~/utils/world/tileMap";

/**
 * Kitchens warm up as the player approaches, and the one cooking your order
 * pulses, so you can always spot where your food is.
 */
export function useKitchenGlow(city: City) {
  const current = new Map<string, number>();
  let t = 0;

  function update(dt: number, playerPos: THREE.Vector3, cookingSlug: string | null) {
    t += dt;
    for (const k of city.kitchens) {
      const d = Math.hypot(k.doorPoint.x - playerPos.x, k.doorPoint.z - playerPos.z);
      let target = d < TILE * 2.4 ? 0.28 * (1 - d / (TILE * 2.4)) + 0.08 : 0;
      if (k.slug === cookingSlug) target = Math.max(target, 0.18 + Math.sin(t * 3) * 0.12);
      const prev = current.get(k.slug) ?? 0;
      const next = prev + (target - prev) * Math.min(1, dt * 6);
      if (Math.abs(next - prev) < 0.002 && next < 0.003) continue;
      current.set(k.slug, next);
      setEmissive(k.materials, 0xfb6b05, next);
    }
  }

  return { update };
}
