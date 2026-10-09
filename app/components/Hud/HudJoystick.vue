<template>
  <div
    ref="baseEl"
    class="hud-joystick hud-pointer"
    :class="{ 'hud-joystick--active': active }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div class="hud-joystick__ring" />
    <div class="hud-joystick__knob" :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }" />
  </div>
</template>

<script setup lang="ts">
import { useInput } from "~/composables/world/useInput";

/** A thumb stick for touch screens. Writes into the shared joystick state. */
const { joystick } = useInput();
const baseEl = ref<HTMLDivElement | null>(null);
const knob = reactive({ x: 0, y: 0 });
const active = ref(false);
const RADIUS = 46;
const DEAD = 0.12;
let pointerId: number | null = null;
let centre = { x: 0, y: 0 };

function onDown(e: PointerEvent) {
  if (pointerId !== null) return;
  pointerId = e.pointerId;
  baseEl.value?.setPointerCapture(e.pointerId);
  const rect = baseEl.value!.getBoundingClientRect();
  centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  active.value = true;
  onMove(e);
}

function onMove(e: PointerEvent) {
  if (e.pointerId !== pointerId) return;
  let dx = e.clientX - centre.x;
  let dy = e.clientY - centre.y;
  const len = Math.hypot(dx, dy);
  if (len > RADIUS) {
    dx = (dx / len) * RADIUS;
    dy = (dy / len) * RADIUS;
  }
  knob.x = dx;
  knob.y = dy;
  const mag = Math.min(1, len / RADIUS);
  if (mag < DEAD) {
    joystick.x = 0;
    joystick.y = 0;
    joystick.magnitude = 0;
    return;
  }
  joystick.x = dx / RADIUS;
  joystick.y = -dy / RADIUS;
  joystick.magnitude = mag;
}

function onUp(e: PointerEvent) {
  if (e.pointerId !== pointerId) return;
  pointerId = null;
  active.value = false;
  knob.x = 0;
  knob.y = 0;
  joystick.x = 0;
  joystick.y = 0;
  joystick.magnitude = 0;
}

onBeforeUnmount(() => {
  joystick.x = 0;
  joystick.y = 0;
  joystick.magnitude = 0;
});
</script>

<style scoped>
.hud-joystick {
  position: absolute;
  left: calc(20px + var(--left));
  bottom: calc(28px + var(--bottom));
  width: 132px;
  height: 132px;
  border-radius: 999px;
  touch-action: none;
  opacity: 0.55;
  transition: opacity 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.hud-joystick--active {
  opacity: 0.95;
}
.hud-joystick__ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: color-mix(in oklab, var(--color-surface) 45%, transparent);
  border: 2px solid color-mix(in oklab, var(--color-primary) 55%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.hud-joystick__knob {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: var(--shadow-float);
  will-change: transform;
}
</style>
