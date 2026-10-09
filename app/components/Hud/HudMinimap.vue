<template>
  <button
    type="button"
    class="hud-minimap hud-pointer"
    :class="{ 'hud-minimap--large': large }"
    :aria-label="large ? 'Shrink the map' : 'Enlarge the map'"
    @click="large = !large"
  >
    <canvas ref="canvasEl" class="hud-minimap__canvas" />
  </button>
</template>

<script setup lang="ts">
import { useWorldStore } from "~/stores/world";
import type { Tile } from "~/utils/types/world";
import { GRID_SIZE, HOME, KITCHEN_PLACEMENTS, ROUNDABOUTS } from "~/utils/world/tileMap";
import worldGrid from "~/utils/worldGrid";

/**
 * A top-down sketch of the grid. Base tiles and the dot overlay are both
 * repainted on every change: 784 rectangles are cheap, and one pass keeps the
 * dark-theme colours honest without a cache to invalidate.
 */
const world = useWorldStore();

const canvasEl = ref<HTMLCanvasElement | null>(null);
const large = ref(false);

let observer: ResizeObserver | null = null;
let tiles: Tile[] = [];

function token(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function tileFill(tile: Tile, palette: Record<string, string>): string {
  switch (tile.kind) {
    case "road":
    case "ring":
      return palette.road!;
    case "roundabout":
      return palette.yard!;
    case "plot":
    case "kitchen":
    case "home":
      return palette.plot!;
    case "landmark":
    case "hub":
      return palette.landmark!;
    case "yard":
      return palette.yard!;
    case "edge":
    default:
      return palette.edge!;
  }
}

function draw() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const size = canvas.clientWidth;
  if (size === 0) return;
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== size * dpr) {
    canvas.width = size * dpr;
    canvas.height = size * dpr;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const palette = {
    road: token("--color-ink-disabled", "#cfc7bf"),
    plot: token("--color-shell", "#f0e2d8"),
    yard: token("--color-map-base", "#eef3ec"),
    edge: token("--color-map-edge", "#e6eee2"),
    landmark: token("--color-line", "#e5d9d1"),
    kitchen: token("--color-brand", "#fb6b05"),
    home: token("--color-success", "#1e7a4c"),
    rider: token("--color-rider", "#d98a2b"),
    player: token("--color-ink", "#1c1310"),
    ring: token("--color-surface", "#ffffff"),
  };

  const cell = size / GRID_SIZE;
  ctx.clearRect(0, 0, size, size);
  for (const tile of tiles) {
    ctx.fillStyle = tileFill(tile, palette);
    ctx.fillRect(tile.x * cell, tile.y * cell, cell + 0.5, cell + 0.5);
  }
  for (const round of ROUNDABOUTS) {
    ctx.fillStyle = palette.road;
    ctx.beginPath();
    ctx.arc((round.x + 0.5) * cell, (round.y + 0.5) * cell, cell * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.yard;
    ctx.beginPath();
    ctx.arc((round.x + 0.5) * cell, (round.y + 0.5) * cell, cell * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  const dot = (x: number, y: number, radius: number, fill: string, ring?: string) => {
    ctx.beginPath();
    ctx.arc((x + 0.5) * cell, (y + 0.5) * cell, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (ring) {
      ctx.lineWidth = Math.max(1.5, cell * 0.3);
      ctx.strokeStyle = ring;
      ctx.stroke();
    }
  };

  for (const kitchen of KITCHEN_PLACEMENTS) dot(kitchen.x, kitchen.y, cell * 0.55, palette.kitchen);
  dot(HOME.x, HOME.y, cell * 0.6, palette.home);
  if (world.rider) dot(world.rider.tile.x, world.rider.tile.y, cell * 0.6, palette.rider, palette.ring);
  dot(world.playerTile.x, world.playerTile.y, cell * 0.65, palette.player, palette.ring);
}

watch(() => [world.playerTile.x, world.playerTile.y, world.rider?.tile.x, world.rider?.tile.y, world.rider?.leg], draw);
watch(large, () => nextTick(draw));

onMounted(() => {
  tiles = worldGrid().tiles;
  draw();
  if (canvasEl.value) {
    observer = new ResizeObserver(draw);
    observer.observe(canvasEl.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.hud-minimap {
  position: absolute;
  top: calc(12px + var(--top));
  right: 12px;
  width: 112px;
  height: 112px;
  padding: 0;
  border-radius: 16px;
  border: 1.5px solid var(--color-line);
  background: color-mix(in oklab, var(--color-surface) 72%, transparent);
  box-shadow: var(--shadow-float);
  overflow: hidden;
  cursor: pointer;
  transition: width 0.3s var(--ease-spring), height 0.3s var(--ease-spring);
}
.hud-minimap--large {
  width: 220px;
  height: 220px;
}
.hud-minimap__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
@media (min-width: 640px) {
  .hud-minimap {
    width: 160px;
    height: 160px;
  }
  .hud-minimap--large {
    width: 220px;
    height: 220px;
  }
}
</style>
