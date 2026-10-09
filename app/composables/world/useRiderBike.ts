import * as THREE from "three";
import type { Vec2 } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { Avatars } from "~/composables/world/useAvatars";
import type { City, KitchenNode } from "~/composables/world/useCityBuilder";
import type { AgentRegistry } from "~/utils/world/agents";
import type { RiderLeg } from "~/stores/world";
import { useVehicle } from "~/composables/world/useVehicle";
import { astar, driveCost } from "~/utils/world/astar";
import { makeDecalTexture } from "~/utils/world/materials";
import { applyRidePose } from "~/utils/world/ridePose";
import { VAN_SPEED, VAN_DOOR_PAUSE_S } from "~/utils/constants/simTimings";

export interface RiderEvents {
  reachedKitchen: () => void;
  reachedHome: () => void;
  returned: () => void;
}

/** The SV650 is 14.5 model units long; this makes it a touch longer than a person is tall. */
export const BIKE_SCALE = 0.19;
/** The model's front points along -X; turn it to +Z. */
export const BIKE_FORWARD_FIX = Math.PI / 2;

/**
 * The order's okada: a motorbike in Foodprint orange with a delivery box on
 * the back and a rider seated on it. Three legs: hub to kitchen, kitchen to
 * home (then it waits at the door), and home back to the hub after handoff.
 */
export function useRiderBike(assets: Assets, avatars: Avatars, scene: THREE.Scene, city: City, registry: AgentRegistry, events: RiderEvents) {
  const vehicle = useVehicle(assets, scene, "bikes/motorcycle", registry, {
    scale: BIKE_SCALE,
    forwardFix: BIKE_FORWARD_FIX,
    tint: 0xfb6b05,
    paint: true,
    paintMatch: /.*/,
    radius: 1.1,
  });
  let leg: RiderLeg | null = null;
  let kitchen: KitchenNode | null = null;
  let blink = 0;
  let arrivedPending = false;
  const lights: THREE.Mesh[] = [];

  // The rider, seated.
  const rider = avatars.createHuman(7, "m");
  const riderRoot = rider.root;
  if (rider.realistic) applyRidePose(riderRoot);
  else rider.animator.play("drive");
  riderRoot.position.set(0, 0.62, -0.1);
  vehicle.group.add(riderRoot);

  // Delivery box with the mark on three sides, and a hazard light on top.
  const box = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.9, 0.95),
    new THREE.MeshStandardMaterial({ color: 0xfb6b05, roughness: 0.55 }),
  );
  shell.castShadow = true;
  box.add(shell);
  box.position.set(0, 1.45, -1.05);
  vehicle.group.add(box);
  makeDecalTexture().then((texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const faces: [THREE.Vector3, number][] = [
      [new THREE.Vector3(0.51, 0.05, 0), Math.PI / 2],
      [new THREE.Vector3(-0.51, 0.05, 0), -Math.PI / 2],
      [new THREE.Vector3(0, 0.05, -0.49), Math.PI],
    ];
    for (const [pos, rot] of faces) {
      const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.66), material);
      decal.position.copy(pos);
      decal.rotation.y = rot;
      box.add(decal);
    }
  });
  const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffd36b, emissive: 0xffb300, emissiveIntensity: 0 });
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.22), lightMaterial);
  light.position.set(0, 0.5, 0);
  box.add(light);
  lights.push(light);

  const pathBetween = (from: Vec2, to: Vec2) => astar(city.grid, from, to, driveCost(city.grid));

  function go(from: Vec2, to: Vec2, nextLeg: RiderLeg) {
    const path = pathBetween(from, to);
    leg = nextLeg;
    if (!path || path.length < 2) {
      vehicle.placeAt(to);
      arrivedPending = true;
      return;
    }
    vehicle.drive(path, VAN_SPEED);
  }

  function spawnForOrder(slug: string) {
    kitchen = city.kitchens.find((k) => k.slug === slug) ?? null;
    if (!kitchen) return;
    go({ x: city.hub.doorRoad.x, y: city.hub.doorRoad.y }, { x: kitchen.doorRoad.x, y: kitchen.doorRoad.y }, "to_kitchen");
  }

  /** Puts the bike where a persisted order says it should be. */
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
    go(vehicle.tile(), { x: city.hub.doorRoad.x, y: city.hub.doorRoad.y }, "returning");
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
    blink += dt;
    const on = leg === "waiting" && Math.sin(blink * 6) > 0;
    for (const l of lights) (l.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 2.2 : 0;
    // A little lean into the turn and bob at speed.
    const lean = THREE.MathUtils.clamp((vehicle.state.heading - prevHeading) * 6, -0.22, 0.22);
    prevHeading = vehicle.state.heading;
    vehicle.root.rotation.z += (lean - vehicle.root.rotation.z) * Math.min(1, dt * 6);

    if (!arrived) return;
    if (leg === "to_kitchen" && kitchen) {
      leg = "to_home";
      events.reachedKitchen();
      go({ x: kitchen.doorRoad.x, y: kitchen.doorRoad.y }, { x: city.home.doorRoad.x, y: city.home.doorRoad.y }, "to_home");
      vehicle.state.paused = VAN_DOOR_PAUSE_S;
    } else if (leg === "to_home") {
      leg = "waiting";
      events.reachedHome();
    } else if (leg === "returning") {
      despawn();
      events.returned();
    }
  }
  let prevHeading = 0;

  function snapshot() {
    if (!leg) return null;
    return { leg, progress: vehicle.progress(), tile: vehicle.tile() };
  }

  function animate(dt: number) {
    if (!rider.realistic) rider.animator.update(dt);
  }

  return { vehicle, rider, update, animate, spawnForOrder, restore, returnToHub, despawn, snapshot, currentLeg: () => leg, dispose: vehicle.dispose };
}

export type RiderBike = ReturnType<typeof useRiderBike>;
