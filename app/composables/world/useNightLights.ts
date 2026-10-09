import * as THREE from "three";
import type { Placement } from "~/utils/types/world";
import { makeGlowTexture } from "~/utils/world/materials";
import { TILE } from "~/utils/world/tileMap";

/**
 * Warm glow sprites on every street lamp and a soft pool on the road under
 * it, faded in by the day/night state. Far cheaper than real point lights.
 */
export function useNightLights(scene: THREE.Scene, placements: Placement[]) {
  const texture = makeGlowTexture("rgba(255,214,140,0.95)", "rgba(255,214,140,0)");
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0, color: 0xffd58c });
  const poolMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0, color: 0xffc46b });
  const group = new THREE.Group();
  group.name = "night-lights";

  for (const p of placements) {
    if (p.model !== "roads/light-curved") continue;
    // The curved lamp's head hangs toward the road, 0.6 model units up.
    const head = new THREE.Vector3(0, 0.58 * TILE, 0.3 * TILE).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.rotY);
    const sprite = new THREE.Sprite(material);
    sprite.position.set(p.x + head.x, head.y, p.z + head.z);
    sprite.scale.setScalar(2.6);
    group.add(sprite);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), poolMaterial);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(p.x + head.x, 0.06, p.z + head.z);
    group.add(pool);
  }
  scene.add(group);

  function update(night: number) {
    const o = THREE.MathUtils.smoothstep(night, 0.3, 0.9);
    material.opacity = o * 0.95;
    poolMaterial.opacity = o * 0.45;
    group.visible = o > 0.01;
  }

  return { update };
}
