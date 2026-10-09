/** Deterministic randomness so the city looks the same on every visit. */

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: a tiny seeded PRNG returning [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable [0,1) number for a tile and a purpose. */
export function tileNoise(x: number, y: number, salt = ""): number {
  return seededRandom(hashString(`${x},${y}:${salt}`))();
}

export function pick<T>(items: readonly T[], t: number): T {
  return items[Math.min(items.length - 1, Math.floor(t * items.length))]!;
}
