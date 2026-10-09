<template>
  <div class="hud-layer">
    <HudTopBar />
    <HudJoystick v-if="touch && !shop.openSheet" />
    <HudEnterPrompt />
    <HudFpsBadge v-if="debug" />
  </div>
</template>

<script setup lang="ts">
import { useShopStore } from "~/stores/shop";

const shop = useShopStore();
const route = useRoute();
const debug = computed(() => "debug" in route.query);
const touch = ref(false);
onMounted(() => {
  touch.value = window.matchMedia("(pointer: coarse)").matches;
});
</script>
