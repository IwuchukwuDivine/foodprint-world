<template>
  <div class="hud-fps">
    {{ world.fps }} fps · {{ world.drawCalls }} calls · {{ world.playerTile.x }},{{ world.playerTile.y }}
  </div>
</template>

<script setup lang="ts">
import { useWorldStore } from "~/stores/world";

const world = useWorldStore();
</script>

<style scoped>
.hud-fps {
  position: absolute;
  left: 12px;
  bottom: calc(12px + var(--bottom));
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--color-ink-well);
  color: var(--color-cream);
  font: 500 12px/1.2 ui-monospace, monospace;
}
</style>
