import * as THREE from "three";
import type { Vec2 } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { City } from "~/composables/world/useCityBuilder";
import { PLAYER_MODEL } from "~/utils/world/manifest";
import { TILE } from "~/utils/world/tileMap";
import { Grid } from "~/utils/world/grid";
import { astar, walkCost } from "~/utils/world/astar";
import { pushOut, nearbyBoxes } from "~/utils/world/collision";
import { makeAnimator } from "~/utils/world/animations";
import { dampAngle, moveTowards } from "~/utils/world/steering";

export const WALK_SPEED = 3.4;
export const RUN_SPEED = 6.2;
const RADIUS = 0.55;
const CHARACTER_SCALE = 3;

/**
 * The third-person character: camera-relative movement, tile walkability plus
 * box push-out, A* auto-walk when a label is tapped, and idle/walk/run clips.
 */
export function usePlayer(assets: Assets, city: City, scene: THREE.Scene) {
  const model = assets.instance(PLAYER_MODEL);
  model.scale.setScalar(CHARACTER_SCALE);
  model.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = false;
  });
  const group = new THREE.Group();
  group.add(model);
  scene.add(group);
  const animator = makeAnimator(model, assets.get(PLAYER_MODEL).gltf.animations);
  animator.play("idle");

  const state = {
    position: group.position,
    heading: 0,
    speed: 0,
    moving: false,
    autoPath: null as Vec2[] | null,
    autoIdx: 0,
    autoTarget: null as string | null,
  };

  // Spawn on the road outside home, facing along the street so the camera
  // sits on the road behind the player rather than inside the house.
  group.position.set(city.home.doorRoad.x * TILE + TILE * 0.9, 0, city.home.doorRoad.y * TILE + TILE * 0.3);
  state.heading = Math.PI / 2;
  group.rotation.y = state.heading;

  const tile = (): Vec2 => Grid.toTile(group.position.x, group.position.z);

  function walkTo(target: Vec2, label: string | null = null) {
    const path = astar(city.grid, tile(), target, walkCost(city.grid));
    if (!path || path.length < 2) {
      state.autoPath = null;
      return false;
    }
    state.autoPath = path.slice(1);
    state.autoIdx = 0;
    state.autoTarget = label;
    return true;
  }

  function cancelWalk() {
    state.autoPath = null;
    state.autoTarget = null;
  }

  function teleport(point: THREE.Vector3) {
    group.position.copy(point);
    cancelWalk();
  }

  /** One fixed step. `input` is camera-relative; `cameraYaw` turns it into world space. */
  function update(dt: number, input: { x: number; y: number; run: boolean; active: boolean }, cameraYaw: number) {
    let dirX = 0;
    let dirZ = 0;
    let wantRun = false;
    let wantMove = false;

    if (input.active) {
      cancelWalk();
      // Forward on screen is away from the camera: the camera sits at +yaw from the pivot.
      const fx = -Math.sin(cameraYaw);
      const fz = -Math.cos(cameraYaw);
      const rx = Math.cos(cameraYaw);
      const rz = -Math.sin(cameraYaw);
      dirX = fx * input.y + rx * input.x;
      dirZ = fz * input.y + rz * input.x;
      wantRun = input.run;
      wantMove = true;
    } else if (state.autoPath) {
      const next = state.autoPath[state.autoIdx];
      if (!next) {
        cancelWalk();
      } else {
        const tx = next.x * TILE;
        const tz = next.y * TILE;
        const dx = tx - group.position.x;
        const dz = tz - group.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.35) {
          state.autoIdx++;
          if (state.autoIdx >= state.autoPath.length) cancelWalk();
        } else {
          dirX = dx / dist;
          dirZ = dz / dist;
          wantMove = true;
          wantRun = state.autoPath.length - state.autoIdx > 3;
        }
      }
    }

    const targetSpeed = wantMove ? (wantRun ? RUN_SPEED : WALK_SPEED) : 0;
    state.speed = moveTowards(state.speed, targetSpeed, 26 * dt);
    if (wantMove) state.heading = dampAngle(state.heading, Math.atan2(dirX, dirZ), 14, dt);

    if (state.speed > 0.01) {
      const stepX = Math.sin(state.heading) * state.speed * dt;
      const stepZ = Math.cos(state.heading) * state.speed * dt;
      const boxes = nearbyBoxes(city.colliders, group.position.x, group.position.z, TILE * 1.5);
      let nx = group.position.x + stepX;
      let nz = group.position.z + stepZ;
      const pushed = pushOut(nx, nz, RADIUS, boxes);
      nx = pushed.x;
      nz = pushed.z;
      // Keep inside the map.
      const limit = (city.grid.size - 1) * TILE + TILE * 0.4;
      nx = THREE.MathUtils.clamp(nx, -TILE * 0.4, limit);
      nz = THREE.MathUtils.clamp(nz, -TILE * 0.4, limit);
      group.position.set(nx, 0, nz);
    }
    group.rotation.y = state.heading;
    state.moving = state.speed > 0.2;
  }

  function animate(dt: number) {
    if (state.speed < 0.2) animator.play("idle");
    else if (state.speed < WALK_SPEED + 0.6) animator.play("walk", THREE.MathUtils.clamp(state.speed / WALK_SPEED, 0.7, 1.3));
    else animator.play("run", THREE.MathUtils.clamp(state.speed / RUN_SPEED, 0.8, 1.2));
    animator.update(dt);
  }

  function dispose() {
    group.removeFromParent();
  }

  return { group, state, tile, walkTo, cancelWalk, teleport, update, animate, dispose };
}

export type Player = ReturnType<typeof usePlayer>;
