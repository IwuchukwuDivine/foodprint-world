<template>
  <header class="hud-top">
    <div class="glass-bar glass-bar--on hud-pointer flex items-center gap-2 py-1.5 pl-2.5 pr-2">
      <BrandLogo mode="mark" :size="22" :to="null" />
      <span class="hud-top__district">
        <Icon name="pin" :size="14" class="text-primary" />
        {{ world.district ?? "Awka" }}
      </span>
      <span class="hud-top__clock">{{ world.clock }}</span>
      <button
        type="button"
        class="hud-top__toggle"
        :aria-label="world.isNight ? 'Switch to day' : 'Switch to night'"
        :title="world.isNight ? 'Switch to day' : 'Switch to night'"
        @click="toggleNight"
      >
        <Icon :name="world.isNight ? 'sun' : 'moon'" :size="16" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useWorldStore } from "~/stores/world";
import { useSettingsStore } from "~/stores/settings";

const world = useWorldStore();
const settings = useSettingsStore();
const api = useWorldApi();

function toggleNight() {
  const next = !world.isNight;
  settings.nightOverride = next;
  api.value?.setNightOverride(next);
}
</script>

<style scoped>
.hud-top {
  position: absolute;
  top: calc(12px + var(--top));
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.hud-top__district {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
}
.hud-top__clock {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink-muted);
  font-variant-numeric: tabular-nums;
  padding-left: 6px;
  border-left: 1.5px solid var(--color-line);
}
.hud-top__toggle {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: none;
  background: var(--color-wash);
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s var(--ease-spring);
}
.hud-top__toggle:hover {
  background: var(--color-shell);
  transform: rotate(-15deg);
}
@media (max-width: 360px) {
  .hud-top__clock {
    display: none;
  }
}
</style>
