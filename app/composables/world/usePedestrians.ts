import * as THREE from "three";
import type { Vec2, Tile } from "~/utils/types/world";
import type { City } from "~/composables/world/useCityBuilder";
import type { Avatars, Human } from "~/composables/world/useAvatars";
import type { Agent, AgentRegistry } from "~/utils/world/agents";
import { astar, walkCost } from "~/utils/world/astar";
import { TILE } from "~/utils/world/tileMap";
import { buildLanePath, type P2 } from "~/utils/world/lanePath";
import { followPolyline, dampAngle, type PolylineState } from "~/utils/world/steering";
import { seededRandom, pick } from "~/utils/world/seededRandom";

interface Walker {
  human: Human;
  group: THREE.Group;
  agent: Agent;
  path: P2[];
  poly: PolylineState;
  heading: number;
  speed: number;
  wait: number;
  walking: boolean;
}

/** Pedestrians keep to the pavement edge of the road, on their right. */
const SIDEWALK_OFFSET = TILE * 0.41;

/**
 * Awka's foot traffic: people strolling the pavements between random road
 * tiles, pausing now and then, stepping around each other and the player,
 * and waiting for a vehicle that is about to cross their path.
 */
export function usePedestrians(avatars: Avatars, scene: THREE.Scene, city: City, registry: AgentRegistry, count: number) {
  const rand = seededRandom(99);
  const roads: Tile[] = city.grid.tiles.filter((t) => t.kind === "road");
  const walkers: Walker[] = [];

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
      w.path = buildLanePath(path, SIDEWALK_OFFSET);
      w.poly = { idx: 0, t: 0 };
      w.speed = 2.0 + rand() * 1.0;
      w.walking = true;
    } else {
      w.wait = 1;
    }
  }

  for (let i = 0; i < count; i++) {
    const human = avatars.createHuman(i);
    const group = new THREE.Group();
    group.add(human.root);
    const start = pick(roads, rand());
    group.position.set(start.x * TILE + (rand() - 0.5) * TILE * 0.5, 0, start.y * TILE + (rand() - 0.5) * TILE * 0.5);
    scene.add(group);
    human.animator.play("idle");
    const agent = registry.add({ kind: "pedestrian", position: group.position, radius: 0.5, heading: 0, speed: 0, active: true });
    walkers.push({ human, group, agent, path: [], poly: { idx: 0, t: 0 }, heading: rand() * 6.28, speed: 2.5, wait: rand() * 3, walking: false });
  }

  function update(dt: number) {
    for (const w of walkers) {
      if (w.wait > 0) {
        w.wait -= dt;
        w.human.animator.play("idle");
        w.agent.speed = 0;
        if (w.wait <= 0) send(w);
        continue;
      }
      if (!w.walking) {
        w.wait = 1 + rand() * 4;
        continue;
      }
      // Hold back for a vehicle about to pass in front.
      const car = registry.blockerAhead(w.agent, 2.6, 1.2, ["vehicle"]);
      if (car && car.speed > 0.5) {
        w.human.animator.play("idle");
        w.agent.speed = 0;
        continue;
      }
      const res = followPolyline(w.path, w.poly, w.speed * dt);
      w.heading = dampAngle(w.heading, res.heading, 8, dt);
      w.group.rotation.y = w.heading;
      w.group.position.set(res.x, 0, res.z);
      // Step around other people.
      const sep = registry.separate(w.agent, ["pedestrian", "player"], 0.5);
      w.group.position.x = sep.x;
      w.group.position.z = sep.z;
      w.agent.heading = w.heading;
      w.agent.speed = w.speed;
      w.human.animator.play("walk", 1.0);
      if (res.done) {
        w.walking = false;
        w.wait = 1 + rand() * 4;
      }
    }
  }

  function animate(dt: number) {
    for (const w of walkers) w.human.animator.update(dt);
  }

  function dispose() {
    for (const w of walkers) {
      registry.remove(w.agent);
      w.group.removeFromParent();
    }
  }

  return { update, animate, dispose };
}
