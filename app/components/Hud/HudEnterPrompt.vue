<template>
  <Transition name="prompt">
    <div v-if="kitchen && !shop.openSheet" class="hud-prompt">
      <AppButton class="hud-pointer" size="md" icon="store" @click="enter">
        <span class="flex items-center gap-2">
          <span>Enter {{ kitchen.name }}</span>
          <kbd class="hud-prompt__key">E</kbd>
        </span>
      </AppButton>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useWorldStore } from "~/stores/world";
import { useShopStore } from "~/stores/shop";
import { KITCHEN_BY_SLUG } from "~/utils/data/kitchens";

const world = useWorldStore();
const shop = useShopStore();

const kitchen = computed(() => (world.nearbyKitchen ? KITCHEN_BY_SLUG[world.nearbyKitchen] : null));

function enter() {
  if (kitchen.value) shop.openStorefront(kitchen.value.slug);
}
</script>

<style scoped>
.hud-prompt {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(96px + var(--bottom));
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.hud-prompt__key {
  display: none;
  padding: 1px 7px;
  border-radius: 6px;
  font: 600 12px var(--font-sans);
  background: color-mix(in oklab, var(--color-cream) 22%, transparent);
  border: 1px solid color-mix(in oklab, var(--color-cream) 45%, transparent);
}
@media (pointer: fine) {
  .hud-prompt__key {
    display: inline-block;
  }
}
.prompt-enter-active,
.prompt-leave-active {
  transition: opacity 0.2s ease, transform 0.3s var(--ease-spring);
}
.prompt-enter-from,
.prompt-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}
</style>
