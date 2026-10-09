import * as THREE from "three";
import type { Vec2, Tile } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { City } from "~/composables/world/useCityBuilder";
import { CHARACTER_KEYS } from "~/utils/world/manifest";
import { astar, walkCost } from "~/utils/world/astar";
import { TILE } from "~/utils/world/tileMap";
import { makeAnimator, type Animator } from "~/utils/world/animations";
import { seededRandom, pick } from "~/utils/world/seededRandom";
import { dampAngle } from "~/utils/world/steering";

interface Walker {
  group: THREE.Group;
  animator: Animator;
  path: Vec2[];
  idx: number;
  heading: number;
  speed: number;
  wait: number;
  offset: { x: number; z: number };
}

/**
 * Awka's foot traffic: a handful of characters strolling the sidewalks between
 * random road tiles, pausing now and then. Each gets a small lateral offset so
 * they do not walk down the exact centre of the road.
 */
export function usePedestrians(assets: Assets, scene: THREE.Scene, city: City, count: number) {
  const rand = seededRandom(99);
  const roads: Tile[] = city.grid.tiles.filter((t) => t.kind === "road");
  const walkers: Walker[] = [];
  const SCALE = 3;

  function randomGoal(from: Vec2): Vec2 {
    for (let i = 0; i < 10; i++) {
      const t = pick(roads, rand());
      const d = Math.abs(t.x - from.x) + Math.abs(t.y - from.y);
      if (d >= 4 && d <= 14) return t;
    }
    return pick(roads, rand());
  }

  function send(w: Walker) {
    const from = { x: Math.round(w.group.position.x / TILE), y: Math.round(w.group.position.z / TILE) };
    const goal = randomGoal(from);
    const path = astar(city.grid, from, goal, walkCost(city.grid));
    if (path && path.length > 1) {
      w.path = path.slice(1);
      w.idx = 0;
      w.speed = 2.2 + rand() * 1.1;
    } else {
      w.wait = 1;
    }
  }

  for (let i = 0; i < count; i++) {
    const key = CHARACTER_KEYS[i % CHARACTER_KEYS.length]!;
    const model = assets.instance(key);
    model.scale.setScalar(SCALE);
    model.traverse((o) => {
      o.castShadow = true;
    });
    const group = new THREE.Group();
    group.add(model);
    const start = pick(roads, rand());
    const offset = { x: (rand() - 0.5) * TILE * 0.6, z: (rand() - 0.5) * TILE * 0.6 };
    group.position.set(start.x * TILE + offset.x, 0, start.y * TILE + offset.z);
    scene.add(group);
    const animator = makeAnimator(model, assets.get(key).gltf.animations);
    animator.play("idle");
    const w: Walker = { group, animator, path: [], idx: 0, heading: rand() * 6.28, speed: 2.5, wait: rand() * 3, offset };
    walkers.push(w);
  }

  function update(dt: number) {
    for (const w of walkers) {
      if (w.wait > 0) {
        w.wait -= dt;
        w.animator.play("idle");
        if (w.wait <= 0) send(w);
        continue;
      }
      const next = w.path[w.idx];
      if (!next) {
        w.wait = 1 + rand() * 4;
        continue;
      }
      const tx = next.x * TILE + w.offset.x;
      const tz = next.y * TILE + w.offset.z;
      const dx = tx - w.group.position.x;
      const dz = tz - w.group.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.3) {
        w.idx++;
        continue;
      }
      w.heading = dampAngle(w.heading, Math.atan2(dx, dz), 8, dt);
      w.group.rotation.y = w.heading;
      const step = Math.min(dist, w.speed * dt);
      w.group.position.x += (dx / dist) * step;
      w.group.position.z += (dz / dist) * step;
      w.animator.play("walk", 1.05);
    }
  }

  function animate(dt: number) {
    for (const w of walkers) w.animator.update(dt);
  }

  function dispose() {
    for (const w of walkers) w.group.removeFromParent();
  }

  return { update, animate, dispose };
}
