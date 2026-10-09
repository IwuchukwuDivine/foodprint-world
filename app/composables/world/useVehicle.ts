import * as THREE from "three";
import type { Vec2 } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { ModelKey } from "~/utils/world/manifest";
import { buildLanePath, type P2 } from "~/utils/world/lanePath";
import { followPolyline, polylineLength, dampAngle, type PolylineState } from "~/utils/world/steering";
import { tintObject, paintObject } from "~/utils/world/materials";
import { Grid } from "~/utils/world/grid";

export const CAR_SCALE = 1.45;
/** Kenney cars are modelled facing +Z; our heading 0 is +Z too. */
const FORWARD_FIX = 0;
const WHEEL_RADIUS = 0.3 * CAR_SCALE;

/**
 * One drivable vehicle: a Kenney car with its wheel nodes found by name,
 * driving a lane polyline with corner slowing and a damped heading.
 */
export function useVehicle(assets: Assets, scene: THREE.Scene, key: ModelKey, tint?: number, options: { paint?: boolean } = {}) {
  const root = assets.instance(key);
  root.scale.setScalar(CAR_SCALE);
  const bounds = assets.get(key).box;
  root.position.y = -bounds.min.y * CAR_SCALE;
  if (tint !== undefined) {
    if (options.paint) paintObject(root, tint, /^(body|door)$/);
    else tintObject(root, tint, /^body$/);
  }
  const group = new THREE.Group();
  group.add(root);
  group.visible = false;
  scene.add(group);

  const wheels: THREE.Object3D[] = [];
  root.traverse((o) => {
    if (/^wheel/.test(o.name)) wheels.push(o);
  });

  const state = {
    path: [] as P2[],
    poly: { idx: 0, t: 0 } as PolylineState,
    length: 0,
    travelled: 0,
    heading: 0,
    speed: 0,
    maxSpeed: 8,
    done: true,
    paused: 0,
  };

  function drive(tiles: Vec2[], speed: number) {
    state.path = buildLanePath(tiles);
    state.poly = { idx: 0, t: 0 };
    state.length = polylineLength(state.path);
    state.travelled = 0;
    state.maxSpeed = speed;
    state.done = state.path.length < 2;
    const first = state.path[0];
    if (first) {
      group.position.set(first.x, 0, first.z);
      if (state.path[1]) {
        state.heading = Math.atan2(state.path[1]!.x - first.x, state.path[1]!.z - first.z);
        group.rotation.y = state.heading + FORWARD_FIX;
      }
    }
    group.visible = true;
  }

  function placeAt(tile: Vec2, heading = 0) {
    const c = Grid.toWorld(tile);
    group.position.set(c.x, 0, c.z);
    state.heading = heading;
    group.rotation.y = heading + FORWARD_FIX;
    state.done = true;
    group.visible = true;
  }

  function hide() {
    group.visible = false;
    state.done = true;
  }

  /** Advances the vehicle; returns true on the step it reaches the end. */
  function update(dt: number): boolean {
    if (state.done || !group.visible) return false;
    if (state.paused > 0) {
      state.paused -= dt;
      return false;
    }
    const probe = followPolyline(state.path, { ...state.poly }, 0);
    const slow = probe.cornerAhead < 2.2 && state.poly.idx < state.path.length - 2 ? 0.55 : 1;
    const target = state.maxSpeed * slow;
    state.speed += (target - state.speed) * Math.min(1, dt * 4);
    const step = state.speed * dt;
    const res = followPolyline(state.path, state.poly, step);
    state.travelled += step;
    group.position.set(res.x, 0, res.z);
    state.heading = dampAngle(state.heading, res.heading, 12, dt);
    group.rotation.y = state.heading + FORWARD_FIX;
    for (const w of wheels) w.rotation.x += step / WHEEL_RADIUS;
    if (res.done) {
      state.done = true;
      state.speed = 0;
      return true;
    }
    return false;
  }

  const progress = () => (state.length > 0 ? Math.min(1, state.travelled / state.length) : 1);

  function tile(): Vec2 {
    return Grid.toTile(group.position.x, group.position.z);
  }

  function dispose() {
    group.removeFromParent();
  }

  return { group, state, drive, placeAt, hide, update, progress, tile, dispose };
}

export type Vehicle = ReturnType<typeof useVehicle>;
