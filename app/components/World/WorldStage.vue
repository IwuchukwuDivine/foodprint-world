<template>
  <div ref="stageEl" class="world-stage">
    <div ref="labelsEl" class="world-labels" />
  </div>
</template>

<script setup lang="ts">
import type { WorldApi } from "~/utils/types/world";
import { useWorld } from "~/composables/world/useWorld";

/**
 * Owns the canvas and the label layer, boots the world, and hands the HUD a
 * command API through provide/inject. Lives under <ClientOnly>.
 */
const emit = defineEmits<{ api: [api: WorldApi] }>();

const stageEl = ref<HTMLDivElement | null>(null);
const labelsEl = ref<HTMLDivElement | null>(null);
let world: ReturnType<typeof useWorld> | null = null;

onMounted(() => {
  if (!stageEl.value || !labelsEl.value) return;
  world = useWorld(stageEl.value, labelsEl.value);
  emit("api", world.api);
  world.boot();
});

onBeforeUnmount(() => {
  world?.dispose();
  world = null;
});
</script>
