import type * as THREE from "three";
import type { Vec2, Tile } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { City } from "~/composables/world/useCityBuilder";
import { useVehicle, type Vehicle } from "~/composables/world/useVehicle";
import type { AgentRegistry } from "~/utils/world/agents";
import { NPC_CAR_KEYS } from "~/utils/world/manifest";
import { astar, driveCost } from "~/utils/world/astar";
import { seededRandom, pick } from "~/utils/world/seededRandom";
import { NPC_CAR_SPEED_MIN, NPC_CAR_SPEED_MAX } from "~/utils/constants/simTimings";

const PALETTE = [0xffffff, 0xf2d4c2, 0xc9d7f5, 0xd7efd3, 0xf6e7b2, 0xe8c8f0, 0xcccccc, 0xf5b7a8];

/**
 * Ambient cars: each picks a far road tile, drives there in its lane, waits a
 * beat, and picks another. No collisions, no traffic lights; it just needs to
 * look alive.
 */
export function useTraffic(assets: Assets, scene: THREE.Scene, city: City, registry: AgentRegistry, count: number) {
  const rand = seededRandom(1234);
  const roads: Tile[] = city.grid.tiles.filter((t) => t.kind === "road" && t.roadMask !== 15 && t.roadMask !== 0);
  const cars: { vehicle: Vehicle; wait: number; last: Vec2 | null }[] = [];

  function randomRoad(exclude?: Vec2): Tile {
    for (let i = 0; i < 20; i++) {
      const t = pick(roads, rand());
      if (!exclude || Math.abs(t.x - exclude.x) + Math.abs(t.y - exclude.y) >= 6) return t;
    }
    return pick(roads, rand());
  }

  function sendSomewhere(car: { vehicle: Vehicle; wait: number; last: Vec2 | null }, from: Vec2) {
    for (let i = 0; i < 6; i++) {
      const goal = randomRoad(from);
      const path = astar(city.grid, from, goal, driveCost(city.grid));
      if (path && path.length > 3) {
        car.vehicle.drive(path, NPC_CAR_SPEED_MIN + rand() * (NPC_CAR_SPEED_MAX - NPC_CAR_SPEED_MIN));
        car.last = from;
        return;
      }
    }
  }

  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const key = NPC_CAR_KEYS[i % NPC_CAR_KEYS.length]!;
    const tint = key === "cars/taxi" || key === "cars/police" ? undefined : pick(PALETTE, rand());
    const vehicle = useVehicle(assets, scene, key, registry, { tint });
    let start = randomRoad();
    while (used.has(`${start.x},${start.y}`)) start = randomRoad();
    used.add(`${start.x},${start.y}`);
    const car = { vehicle, wait: rand() * 2, last: null };
    cars.push(car);
    sendSomewhere(car, start);
  }

  function update(dt: number) {
    for (const car of cars) {
      if (car.wait > 0) {
        car.wait -= dt;
        if (car.wait <= 0) sendSomewhere(car, car.vehicle.tile());
        continue;
      }
      const arrived = car.vehicle.update(dt);
      if (arrived) car.wait = 0.6 + rand() * 2.5;
    }
  }

  function dispose() {
    for (const car of cars) car.vehicle.dispose();
  }

  return { update, dispose, cars };
}
