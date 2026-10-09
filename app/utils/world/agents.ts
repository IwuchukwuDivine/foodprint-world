import type * as THREE from "three";

export type AgentKind = "player" | "pedestrian" | "vehicle";

/** Anything that moves and should not be walked or driven through. */
export interface Agent {
  kind: AgentKind;
  position: THREE.Vector3;
  radius: number;
  /** Heading in radians (atan2(dx, dz)); used for look-ahead checks. */
  heading: number;
  /** Current speed in world units per second. */
  speed: number;
  active: boolean;
}

/**
 * A flat registry of moving things. Systems register their agents once and
 * query it each step; with a few dozen agents a linear scan is nothing.
 */
export class AgentRegistry {
  readonly agents: Agent[] = [];

  add(agent: Agent) {
    this.agents.push(agent);
    return agent;
  }

  remove(agent: Agent) {
    const i = this.agents.indexOf(agent);
    if (i >= 0) this.agents.splice(i, 1);
  }

  /**
   * The nearest agent inside a box ahead of `self`: `ahead` units long along
   * its heading and `lateral` units to either side. Null when the way is clear.
   */
  blockerAhead(self: Agent, ahead: number, lateral: number, kinds: AgentKind[]): Agent | null {
    const sx = Math.sin(self.heading);
    const sz = Math.cos(self.heading);
    let best: Agent | null = null;
    let bestD = Infinity;
    for (const other of this.agents) {
      if (other === self || !other.active || !kinds.includes(other.kind)) continue;
      const dx = other.position.x - self.position.x;
      const dz = other.position.z - self.position.z;
      const forward = dx * sx + dz * sz;
      if (forward < -other.radius || forward > ahead + other.radius) continue;
      const side = Math.abs(dx * sz - dz * sx);
      if (side > lateral + other.radius) continue;
      if (forward < bestD) {
        bestD = forward;
        best = other;
      }
    }
    return best;
  }

  /**
   * Pushes `self` out of any overlapping agent of the given kinds. Returns the
   * corrected position (does not mutate).
   */
  separate(self: Agent, kinds: AgentKind[], strength = 1): { x: number; z: number } {
    let px = self.position.x;
    let pz = self.position.z;
    for (const other of this.agents) {
      if (other === self || !other.active || !kinds.includes(other.kind)) continue;
      const dx = px - other.position.x;
      const dz = pz - other.position.z;
      const d = Math.hypot(dx, dz);
      const min = self.radius + other.radius;
      if (d >= min || d < 1e-4) continue;
      const push = (min - d) * strength;
      px += (dx / d) * push;
      pz += (dz / d) * push;
    }
    return { x: px, z: pz };
  }
}
