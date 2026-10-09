<template>
  <Transition name="loading">
    <div v-if="visible" class="loading-screen">
      <div class="loading-screen__card">
        <BrandLogo mode="stacked" :size="44" :to="null" />
        <p class="fp-eyebrow m-0 mt-5 text-primary">Awka, Anambra</p>
        <h1 class="fp-display m-0 mt-1 text-[34px] text-ink">Foodprint World</h1>
        <p class="m-0 mt-2 max-w-[320px] text-[15px] leading-relaxed text-ink-soft">
          Walk the streets, step into a kitchen, place an order and watch your rider bring it home.
        </p>

        <div class="loading-screen__track mt-7" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
          <div class="loading-screen__fill" :style="{ width: `${percent}%` }" />
        </div>
        <p class="m-0 mt-2 text-[13px] font-medium text-ink-muted">
          <template v-if="failed">Something went wrong loading the city. Refresh to try again.</template>
          <template v-else-if="!ready">{{ tip }}</template>
          <template v-else>Awka is ready.</template>
        </p>

        <AppButton
          class="mt-6"
          size="lg"
          block
          icon="rider"
          :disabled="!ready"
          :loading="!ready && !failed"
          @click="emit('enter')"
        >
          Enter Awka
        </AppButton>

        <p class="m-0 mt-4 text-[12.5px] text-ink-faint">
          <span class="hidden sm:inline">WASD to walk, Shift to run, E to enter a kitchen. </span>
          <span class="sm:hidden">Use the joystick to walk. Tap a kitchen to go there. </span>
          Drag to look around.
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  progress: number;
  ready: boolean;
  failed: boolean;
}>();

const emit = defineEmits<{ enter: [] }>();

const percent = computed(() => Math.round(Math.min(1, props.progress) * 100));

const TIPS = [
  "Laying the roads around Aroma Junction",
  "Opening the gate at Unizik",
  "Firing up the grills at Suya Spot",
  "Stocking Eke Awka market",
  "Parking the riders at the hub",
  "Planting palms along the ring road",
];
const tip = computed(() => TIPS[Math.min(TIPS.length - 1, Math.floor(props.progress * TIPS.length))]);
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--color-brand) 14%, transparent), transparent 60%),
    var(--color-background);
}
.loading-screen__card {
  width: min(420px, 100%);
  padding: 32px 28px;
  border-radius: 28px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-line);
  box-shadow: var(--shadow-modal);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.loading-screen__track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: var(--color-shell);
  overflow: hidden;
}
.loading-screen__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary), var(--color-brand));
  transition: width 0.3s var(--ease-spring);
}
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.5s ease, transform 0.5s var(--ease-spring);
}
.loading-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
