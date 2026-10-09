<template>
  <div>
    <ClientOnly>
      <WorldStage @api="onApi" />
    </ClientOnly>
    <WorldLoadingScreen
      :visible="!world.loading.entered"
      :progress="world.loading.progress"
      :ready="world.loading.ready"
      :failed="world.loading.failed"
      @enter="enter"
    />
    <HudRoot v-if="world.loading.entered" />
    <ShopRoot />
  </div>
</template>

<script setup lang="ts">
import type { WorldApi } from "~/utils/types/world";
import { useWorldStore } from "~/stores/world";
import { WORLD_API_KEY } from "~/utils/world/apiKey";

useHead({ htmlAttrs: { class: "world" } });

const world = useWorldStore();
const api = shallowRef<WorldApi | null>(null);
provide(WORLD_API_KEY, api);

function onApi(next: WorldApi) {
  api.value = next;
}

function enter() {
  api.value?.enter();
}
</script>
