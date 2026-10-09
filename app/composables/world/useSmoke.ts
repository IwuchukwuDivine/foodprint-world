import * as THREE from "three";
import type { City } from "~/composables/world/useCityBuilder";
import { makeGlowTexture } from "~/utils/world/materials";

interface Emitter {
  slug: string;
  points: THREE.Points;
  positions: Float32Array;
  ages: Float32Array;
  origin: THREE.Vector3;
  active: boolean;
  idle: boolean;
}

const COUNT = 36;
const LIFE = 2.6;

/**
 * Chimney smoke per kitchen: a Points cloud whose particles rise, sway and
 * fade. Active while an order is cooking; a few kitchens idle-smoke faintly.
 */
export function useSmoke(scene: THREE.Scene, city: City) {
  const texture = makeGlowTexture("rgba(255,250,245,0.85)", "rgba(255,250,245,0)");
  const material = new THREE.PointsMaterial({
    size: 1.6,
    map: texture,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    sizeAttenuation: true,
    color: 0xfff4ea,
  });
  const emitters: Emitter[] = [];

  city.kitchens.forEach((k, i) => {
    const positions = new Float32Array(COUNT * 3);
    const ages = new Float32Array(COUNT);
    for (let j = 0; j < COUNT; j++) ages[j] = Math.random() * LIFE;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.visible = false;
    scene.add(points);
    emitters.push({ slug: k.slug, points, positions, ages, origin: k.chimney.clone(), active: false, idle: i % 4 === 0 && k.kitchen.vendorType === "restaurant" });
  });

  function set(slug: string, on: boolean) {
    const e = emitters.find((x) => x.slug === slug);
    if (e) e.active = on;
  }

  function update(dt: number) {
    for (const e of emitters) {
      const show = e.active || e.idle;
      e.points.visible = show;
      if (!show) continue;
      const rate = e.active ? 1 : 0.35;
      const pos = e.positions;
      for (let j = 0; j < COUNT; j++) {
        e.ages[j]! += dt * rate;
        if (e.ages[j]! > LIFE) e.ages[j] = 0;
        const a = e.ages[j]!;
        const t = a / LIFE;
        pos[j * 3] = e.origin.x + Math.sin(a * 2.1 + j) * 0.35 * t;
        pos[j * 3 + 1] = e.origin.y + a * 1.3;
        pos[j * 3 + 2] = e.origin.z + Math.cos(a * 1.7 + j * 0.7) * 0.35 * t;
      }
      e.points.geometry.attributes.position!.needsUpdate = true;
    }
  }

  return { set, update };
}
