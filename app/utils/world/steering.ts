/** Shortest-way angular damping. */
export function dampAngle(current: number, target: number, k: number, dt: number): number {
  let delta = target - current;
  delta = Math.atan2(Math.sin(delta), Math.cos(delta));
  return current + delta * (1 - Math.exp(-k * dt));
}

export function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

export interface PolylineState {
  idx: number;
  /** Distance along the current segment. */
  t: number;
}

/**
 * Advances along a polyline by `distance`, returning the new position, the
 * heading of the segment and whether the end was reached.
 */
export function followPolyline(
  points: { x: number; z: number }[],
  state: PolylineState,
  distance: number,
): { x: number; z: number; heading: number; done: boolean; cornerAhead: number } {
  let remaining = distance;
  while (state.idx < points.length - 1) {
    const a = points[state.idx]!;
    const b = points[state.idx + 1]!;
    const segLen = Math.hypot(b.x - a.x, b.z - a.z);
    const left = segLen - state.t;
    if (remaining < left) {
      state.t += remaining;
      const u = state.t / segLen;
      return {
        x: a.x + (b.x - a.x) * u,
        z: a.z + (b.z - a.z) * u,
        heading: Math.atan2(b.x - a.x, b.z - a.z),
        done: false,
        cornerAhead: left - remaining,
      };
    }
    remaining -= left;
    state.idx++;
    state.t = 0;
  }
  const last = points[points.length - 1]!;
  const prev = points[Math.max(0, points.length - 2)]!;
  return { x: last.x, z: last.z, heading: Math.atan2(last.x - prev.x, last.z - prev.z), done: true, cornerAhead: 0 };
}

export function polylineLength(points: { x: number; z: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.z - points[i - 1]!.z);
  }
  return total;
}
