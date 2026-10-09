import * as THREE from "three";
import type { Vec2 } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { ModelKey } from "~/utils/world/manifest";
import type { Agent, AgentRegistry } from "~/utils/world/agents";
import { buildLanePath, type P2 } from "~/utils/world/lanePath";
import { followPolyline, polylineLength, dampAngle, type PolylineState } from "~/utils/world/steering";
import { tintObject, paintObject } from "~/utils/world/materials";
import { Grid } from "~/utils/world/grid";

export const CAR_SCALE = 1.45;

export interface VehicleOptions {
  /** Model scale; Kenney cars use CAR_SCALE. */
  scale?: number;
  /** Rotation that turns the model's modelled front toward +Z. */
  forwardFix?: number;
  tint?: number;
  /** Repaint saturated panels instead of multiplying (for non-white bodies). */
  paint?: boolean;
  /** Mesh-name filter for the tint or paint. */
  paintMatch?: RegExp;
  /** Wheel radius in world units for spin; wheels are found by name. */
  wheelRadius?: number;
  /** Collision footprint. */
  radius?: number;
}

/**
 * One drivable vehicle driving a lane polyline with corner slowing, a damped
 * heading and, when the model has them, spinning wheels. It yields to any
 * person in front of it and keeps its distance from the vehicle ahead.
 */
export function useVehicle(assets: Assets, scene: THREE.Scene, key: ModelKey | string, registry: AgentRegistry, options: VehicleOptions = {}) {
  const scale = options.scale ?? CAR_SCALE;
  const forwardFix = options.forwardFix ?? 0;
  const root = assets.instance(key as ModelKey);
  root.scale.setScalar(scale);
  const bounds = assets.get(key as ModelKey).box;
  root.position.y = -bounds.min.y * scale;
  root.rotation.y = forwardFix;
  if (options.tint !== undefined) {
    if (options.paint) paintObject(root, options.tint, options.paintMatch ?? /^(body|door)$/);
    else tintObject(root, options.tint, options.paintMatch ?? /^body$/);
  }
  const group = new THREE.Group();
  group.add(root);
  group.visible = false;
  scene.add(group);

  const wheels: THREE.Object3D[] = [];
  root.traverse((o) => {
    if (/^wheel/.test(o.name)) wheels.push(o);
  });
  const wheelRadius = options.wheelRadius ?? 0.3 * scale;

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
    yielding: false,
  };

  const agent: Agent = registry.add({
    kind: "vehicle",
    position: group.position,
    radius: options.radius ?? 1.6,
    heading: 0,
    speed: 0,
    active: false,
  });

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
        group.rotation.y = state.heading;
      }
    }
    group.visible = true;
    agent.active = true;
    agent.heading = state.heading;
  }

  function placeAt(tile: Vec2, heading = 0) {
    const c = Grid.toWorld(tile);
    group.position.set(c.x, 0, c.z);
    state.heading = heading;
    group.rotation.y = heading;
    state.done = true;
    group.visible = true;
    agent.active = true;
    agent.heading = heading;
    agent.speed = 0;
  }

  function hide() {
    group.visible = false;
    state.done = true;
    agent.active = false;
    agent.speed = 0;
  }

  /** Advances the vehicle; returns true on the step it reaches the end. */
  function update(dt: number): boolean {
    if (state.done || !group.visible) return false;
    if (state.paused > 0) {
      state.paused -= dt;
      agent.speed = 0;
      return false;
    }
    const probe = followPolyline(state.path, { ...state.poly }, 0);
    const slow = probe.cornerAhead < 2.2 && state.poly.idx < state.path.length - 2 ? 0.55 : 1;
    let target = state.maxSpeed * slow;

    // Yield to people in front, and keep a gap behind the vehicle ahead.
    const person = registry.blockerAhead(agent, 4.6, 1.3, ["player", "pedestrian"]);
    const car = registry.blockerAhead(agent, 3.8, 1.0, ["vehicle"]);
    state.yielding = !!person;
    if (person) target = 0;
    else if (car) target = Math.min(target, Math.max(0, car.speed * 0.9));

    const accel = target < state.speed ? 9 : 4;
    state.speed += (target - state.speed) * Math.min(1, dt * accel);
    if (state.speed < 0.02) state.speed = 0;
    const step = state.speed * dt;
    const res = followPolyline(state.path, state.poly, step);
    state.travelled += step;
    group.position.set(res.x, 0, res.z);
    state.heading = dampAngle(state.heading, res.heading, 12, dt);
    group.rotation.y = state.heading;
    agent.heading = state.heading;
    agent.speed = state.speed;
    for (const w of wheels) w.rotation.x += step / wheelRadius;
    if (res.done) {
      state.done = true;
      state.speed = 0;
      agent.speed = 0;
      return true;
    }
    return false;
  }

  const progress = () => (state.length > 0 ? Math.min(1, state.travelled / state.length) : 1);

  function tile(): Vec2 {
    return Grid.toTile(group.position.x, group.position.z);
  }

  function dispose() {
    registry.remove(agent);
    group.removeFromParent();
  }

  return { group, root, state, agent, drive, placeAt, hide, update, progress, tile, dispose };
}

export type Vehicle = ReturnType<typeof useVehicle>;
