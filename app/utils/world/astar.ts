import type { Vec2 } from "~/utils/types/world";
import type { Grid } from "~/utils/world/grid";
import { tileKey } from "~/utils/world/grid";

/**
 * A* over the tile grid. `cost` returns the price of stepping onto a tile, or
 * Infinity to forbid it. Returns the path including both ends, or null.
 */
export function astar(
  grid: Grid,
  start: Vec2,
  goal: Vec2,
  cost: (x: number, y: number) => number,
  maxExpansions = 4000,
): Vec2[] | null {
  const startKey = tileKey(start.x, start.y);
  const goalKey = tileKey(goal.x, goal.y);
  if (startKey === goalKey) return [start];

  const open: { key: string; x: number; y: number; f: number }[] = [];
  const g = new Map<string, number>([[startKey, 0]]);
  const came = new Map<string, string>();
  const closed = new Set<string>();
  const h = (x: number, y: number) => Math.abs(x - goal.x) + Math.abs(y - goal.y);

  open.push({ key: startKey, x: start.x, y: start.y, f: h(start.x, start.y) });
  let expansions = 0;

  while (open.length && expansions++ < maxExpansions) {
    // Small open sets: a linear min scan beats a heap for our 28x28 grid.
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i]!.f < open[bi]!.f) bi = i;
    const current = open.splice(bi, 1)[0]!;
    if (current.key === goalKey) {
      const path: Vec2[] = [];
      let k: string | undefined = current.key;
      while (k) {
        const [x, y] = k.split(",").map(Number) as [number, number];
        path.push({ x, y });
        k = came.get(k);
      }
      return path.reverse();
    }
    closed.add(current.key);
    const gc = g.get(current.key)!;
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as const) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (!grid.inBounds(nx, ny)) continue;
      const nk = tileKey(nx, ny);
      if (closed.has(nk)) continue;
      const c = cost(nx, ny);
      if (!Number.isFinite(c)) continue;
      const ng = gc + c;
      if (ng < (g.get(nk) ?? Infinity)) {
        g.set(nk, ng);
        came.set(nk, current.key);
        const existing = open.find((o) => o.key === nk);
        const f = ng + h(nx, ny);
        if (existing) existing.f = f;
        else open.push({ key: nk, x: nx, y: ny, f });
      }
    }
  }
  return null;
}

/** Walking cost: sidewalks are free, blocked tiles forbidden. */
export function walkCost(grid: Grid) {
  return (x: number, y: number) => {
    const t = grid.at(x, y);
    if (!t || !t.walkable) return Infinity;
    return t.drivable ? 1 : 1.4;
  };
}

/** Driving cost: roads only. */
export function driveCost(grid: Grid) {
  return (x: number, y: number) => (grid.isDrivable(x, y) ? 1 : Infinity);
}
