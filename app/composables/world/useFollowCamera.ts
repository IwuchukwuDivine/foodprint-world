import * as THREE from "three";
import type { Aabb } from "~/utils/types/world";

export interface FollowTarget {
  position: THREE.Vector3;
  /** Heading in radians, used for the auto-return behind the target. */
  heading: number;
}

/**
 * A spherical follow camera: drag to orbit, pinch or wheel to zoom, and it
 * eases back behind the target a moment after you let go while they move.
 */
export function useFollowCamera(camera: THREE.PerspectiveCamera, element: HTMLElement, touch: boolean) {
  const state = {
    yaw: Math.PI,
    pitch: 0.58,
    dist: touch ? 9.5 : 11,
    targetYaw: Math.PI,
    targetPitch: 0.58,
    targetDist: touch ? 9.5 : 11,
    pivot: new THREE.Vector3(),
    userOrbitedAt: -Infinity,
    viewDist: touch ? 9.5 : 11,
    viewPitch: 0.58,
  };
  const MIN_PITCH = 0.16;
  const MAX_PITCH = 1.2;
  const MIN_DIST = 4.5;
  const MAX_DIST = 18;
  let target: FollowTarget | null = null;
  let locked = false;
  let fixedDist: number | null = null;

  let colliders: Aabb[] = [];
  const setColliders = (boxes: Aabb[]) => {
    colliders = boxes;
  };

  /** Whether a point sits inside (or hugs) any nearby building box, below roof height. */
  function blockedAt(x: number, y: number, z: number, near: Aabb[]): boolean {
    if (y > 5.2) return false;
    for (const b of near) {
      if (x > b.minX - 0.25 && x < b.maxX + 0.25 && z > b.minZ - 0.25 && z < b.maxZ + 0.25) return true;
    }
    return false;
  }

  /**
   * Finds a camera placement that does not sit inside a building: first by
   * tilting the view up over the roofs, then, failing that, by pulling in.
   * Returns the pitch and distance to use this frame.
   */
  function resolveView(pivot: THREE.Vector3, yaw: number, pitch: number, wanted: number): { pitch: number; dist: number } {
    const px = pivot.x;
    const pz = pivot.z;
    const near = colliders.filter(
      (b) => b.maxX > px - wanted - 1 && b.minX < px + wanted + 1 && b.maxZ > pz - wanted - 1 && b.minZ < pz + wanted + 1,
    );
    if (!near.length) return { pitch, dist: wanted };
    const steps = 12;
    const sy = Math.sin(yaw);
    const cy = Math.cos(yaw);
    const clearAt = (p: number): number => {
      const cp = Math.cos(p);
      const sp = Math.sin(p);
      for (let i = 1; i <= steps; i++) {
        const d = (wanted * i) / steps;
        if (blockedAt(px + sy * cp * d, pivot.y + sp * d, pz + cy * cp * d, near)) return (wanted * (i - 1)) / steps;
      }
      return wanted;
    };
    if (clearAt(pitch) >= wanted) return { pitch, dist: wanted };
    for (let p = pitch + 0.12; p <= MAX_PITCH; p += 0.12) {
      if (clearAt(p) >= wanted) return { pitch: p, dist: wanted };
    }
    return { pitch: Math.min(MAX_PITCH, pitch + 0.35), dist: Math.max(3.6, clearAt(Math.min(MAX_PITCH, pitch + 0.35))) };
  }

  const pointers = new Map<number, { x: number; y: number }>();
  let pinchDist = 0;
  let dragging = false;
  let moved = 0;

  function onPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement) !== element.querySelector("canvas") && (e.target as HTMLElement) !== element) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    element.setPointerCapture?.(e.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
    }
    dragging = true;
    moved = 0;
  }

  function onPointerMove(e: PointerEvent) {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved += Math.abs(dx) + Math.abs(dy);
    if (pointers.size === 1 && !locked) {
      state.targetYaw -= dx * 0.0055;
      state.targetPitch = THREE.MathUtils.clamp(state.targetPitch + dy * 0.004, MIN_PITCH, MAX_PITCH);
      state.userOrbitedAt = performance.now();
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (pinchDist > 0) zoomBy(pinchDist / d);
      pinchDist = d;
    }
  }

  function onPointerUp(e: PointerEvent) {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) dragging = false;
    if (pointers.size < 2) pinchDist = 0;
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const dy = THREE.MathUtils.clamp(e.deltaY, -60, 60);
    zoomBy(Math.exp(dy * 0.004));
  }

  function zoomBy(factor: number) {
    if (fixedDist !== null) return;
    state.targetDist = THREE.MathUtils.clamp(state.targetDist * factor, MIN_DIST, MAX_DIST);
  }

  element.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  element.addEventListener("wheel", onWheel, { passive: false });

  function setTarget(next: FollowTarget | null, options: { snap?: boolean; lockOrbit?: boolean; dist?: number | null; pitch?: number } = {}) {
    target = next;
    locked = options.lockOrbit ?? false;
    fixedDist = options.dist ?? null;
    if (fixedDist !== null) state.targetDist = fixedDist;
    if (options.pitch !== undefined) state.targetPitch = options.pitch;
    if (options.snap && next) {
      state.pivot.copy(next.position);
      state.yaw = state.targetYaw = next.heading + Math.PI;
    }
  }

  const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

  function update(dt: number, moving: boolean) {
    if (!target) return;
    const pivotGoal = target.position.clone();
    pivotGoal.y += 1.5;
    state.pivot.lerp(pivotGoal, 1 - Math.exp(-9 * dt));

    const sinceOrbit = performance.now() - state.userOrbitedAt;
    if ((moving && sinceOrbit > 1500 && !dragging) || locked) {
      // Ease back behind the target. Take the short way around the circle.
      const desired = target.heading + Math.PI;
      let delta = desired - state.targetYaw;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      state.targetYaw += delta * Math.min(1, dt * (locked ? 2.5 : 1.6));
    }

    state.yaw = damp(state.yaw, state.targetYaw, 7, dt);
    state.pitch = damp(state.pitch, state.targetPitch, 7, dt);
    state.dist = damp(state.dist, state.targetDist, 6, dt);

    const view = resolveView(state.pivot, state.yaw, state.pitch, state.dist);
    // Snap in when blocked, ease back out when the way is clear.
    state.viewDist = view.dist < state.viewDist ? view.dist : damp(state.viewDist, view.dist, 3, dt);
    state.viewPitch = view.pitch > state.viewPitch ? damp(state.viewPitch, view.pitch, 14, dt) : damp(state.viewPitch, view.pitch, 4, dt);
    const dir = new THREE.Vector3(
      Math.sin(state.yaw) * Math.cos(state.viewPitch),
      Math.sin(state.viewPitch),
      Math.cos(state.yaw) * Math.cos(state.viewPitch),
    );
    camera.position.copy(state.pivot).add(dir.multiplyScalar(state.viewDist));
    if (camera.position.y < 1.2) camera.position.y = 1.2;
    camera.lookAt(state.pivot);
  }

  /** The camera's yaw, so input can be camera-relative. */
  const yaw = () => state.yaw;

  /** True while a drag gesture is in progress and has moved; taps are not drags. */
  const isDragging = () => dragging && moved > 6;

  function dispose() {
    element.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    element.removeEventListener("wheel", onWheel);
  }

  return { update, setTarget, setColliders, yaw, isDragging, dispose, state };
}
