import * as THREE from "three";
import type { Vec2 } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { City, KitchenNode } from "~/composables/world/useCityBuilder";
import type { RiderLeg } from "~/stores/world";
import { useVehicle } from "~/composables/world/useVehicle";
import { astar, driveCost } from "~/utils/world/astar";
import { makeDecalTexture } from "~/utils/world/materials";
import { VAN_SPEED, VAN_DOOR_PAUSE_S } from "~/utils/constants/simTimings";

export interface RiderEvents {
  reachedKitchen: () => void;
  reachedHome: () => void;
  returned: () => void;
}

/**
 * The order's delivery van, in Foodprint orange with the mark on its sides.
 * Three legs: hub to kitchen, kitchen to home (then it waits at the door),
 * and home back to the hub after the handoff.
 */
export function useRiderVan(assets: Assets, scene: THREE.Scene, city: City, events: RiderEvents) {
  const vehicle = useVehicle(assets, scene, "cars/delivery", 0xfb6b05, { paint: true });
  let leg: RiderLeg | null = null;
  let kitchen: KitchenNode | null = null;
  let blink = 0;
  const lights: THREE.Mesh[] = [];

  // Decals on both sides.
  makeDecalTexture().then((texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const size = 1.1;
    for (const side of [1, -1]) {
      const decal = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
      decal.position.set(side * 1.12, 1.55, 0.15);
      decal.rotation.y = side * Math.PI / 2;
      vehicle.group.add(decal);
    }
    // A hazard light on the roof for the waiting state.
    const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffd36b, emissive: 0xffb300, emissiveIntensity: 0 });
    for (const side of [1, -1]) {
      const light = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.22), lightMaterial.clone());
      light.position.set(side * 0.6, 2.32, -0.6);
      vehicle.group.add(light);
      lights.push(light);
    }
  });

  const pathBetween = (from: Vec2, to: Vec2) => astar(city.grid, from, to, driveCost(city.grid));

  function go(from: Vec2, to: Vec2, nextLeg: RiderLeg) {
    const path = pathBetween(from, to);
    leg = nextLeg;
    if (!path || path.length < 2) {
      vehicle.placeAt(to);
      vehicle.state.done = true;
      // Fire arrival on the next update.
      arrivedPending = true;
      return;
    }
    vehicle.drive(path, VAN_SPEED);
  }
  let arrivedPending = false;

  function spawnForOrder(slug: string) {
    kitchen = city.kitchens.find((k) => k.slug === slug) ?? null;
    if (!kitchen) return;
    go({ x: city.hub.doorRoad.x, y: city.hub.doorRoad.y }, { x: kitchen.doorRoad.x, y: kitchen.doorRoad.y }, "to_kitchen");
  }

  /** Puts the van where a persisted order says it should be. */
  function restore(slug: string, phase: RiderLeg) {
    kitchen = city.kitchens.find((k) => k.slug === slug) ?? null;
    if (!kitchen) return;
    const k = { x: kitchen.doorRoad.x, y: kitchen.doorRoad.y };
    const h = { x: city.home.doorRoad.x, y: city.home.doorRoad.y };
    if (phase === "to_kitchen") spawnForOrder(slug);
    else if (phase === "to_home") go(k, h, "to_home");
    else if (phase === "waiting") {
      vehicle.placeAt(h, Math.PI / 2);
      leg = "waiting";
    } else if (phase === "returning") returnToHub();
  }

  function returnToHub() {
    const from = vehicle.tile();
    go(from, { x: city.hub.doorRoad.x, y: city.hub.doorRoad.y }, "returning");
  }

  function despawn() {
    vehicle.hide();
    leg = null;
    kitchen = null;
  }

  function update(dt: number) {
    if (!leg) return;
    let arrived = vehicle.update(dt);
    if (arrivedPending) {
      arrivedPending = false;
      arrived = true;
    }
    // Hazard blink while waiting at the door.
    blink += dt;
    const on = leg === "waiting" && Math.sin(blink * 6) > 0;
    for (const l of lights) (l.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 2.2 : 0;

    if (!arrived) return;
    if (leg === "to_kitchen" && kitchen) {
      leg = "to_home";
      vehicle.state.paused = VAN_DOOR_PAUSE_S;
      const k = { x: kitchen.doorRoad.x, y: kitchen.doorRoad.y };
      const h = { x: city.home.doorRoad.x, y: city.home.doorRoad.y };
      events.reachedKitchen();
      go(k, h, "to_home");
      vehicle.state.paused = VAN_DOOR_PAUSE_S;
    } else if (leg === "to_home") {
      leg = "waiting";
      events.reachedHome();
    } else if (leg === "returning") {
      despawn();
      events.returned();
    }
  }

  function snapshot() {
    if (!leg) return null;
    return { leg, progress: vehicle.progress(), tile: vehicle.tile() };
  }

  return { vehicle, update, spawnForOrder, restore, returnToHub, despawn, snapshot, currentLeg: () => leg, dispose: vehicle.dispose };
}

export type RiderVan = ReturnType<typeof useRiderVan>;
