<template>
  <div
    class="app-img"
    :class="wrapperClass"
    :style="wrapperStyle"
  >
    <img
      v-if="src && !hasFailed"
      ref="imgRef"
      v-bind="imgAttrs"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      @load="isLoaded = true"
      @error="hasFailed = true"
    />

    <!-- Shimmer while the photo streams in -->
    <span v-if="src && !hasFailed && !isLoaded" class="app-img__shimmer" aria-hidden="true" />

    <!-- Branded fallback — many vendors won't have photos at launch -->
    <span
      v-if="!src || hasFailed"
      class="grid h-full w-full place-items-center bg-wash"
      role="img"
      :aria-label="alt"
    >
      <Icon name="image" :size="fallbackIconSize" class="text-primary/40" />
    </span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    src?: string;
    alt: string;
    aspect?: "square" | "video" | "4/3";
    /** Any CSS aspect-ratio, e.g. "3 / 2" — wins over aspect. */
    ratio?: string;
    /** `none` when the parent already clips (a tile with its own radius). */
    rounded?: "none" | "lg" | "2xl" | "full";
    fallbackIconSize?: number;
  }>(),
  {
    src: undefined,
    aspect: "square",
    ratio: undefined,
    rounded: "2xl",
    fallbackIconSize: 36,
  },
);

const isLoaded = ref(false);
const hasFailed = ref(false);
const imgRef = ref<HTMLImageElement | null>(null);

/* class/style stay on the wrapper; everything else goes to the img. */
const attrs = useAttrs();
const imgAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const ASPECTS = { "square": "1 / 1", "video": "16 / 9", "4/3": "4 / 3" };

const resolvedRatio = computed(() => props.ratio ?? ASPECTS[props.aspect]);

/* Composed on the wrapper; kept in script so the template stays cast-free. */
const wrapperClass = computed(() => [
  roundedClass.value,
  (attrs.class as string) ?? "w-full",
]);
const wrapperStyle = computed(() => [
  { aspectRatio: resolvedRatio.value },
  attrs.style as string | undefined,
]);

const roundedClass = computed(
  () =>
    ({ "none": "", "lg": "rounded-lg", "2xl": "rounded-2xl", "full": "rounded-full" })[
      props.rounded
    ],
);

watch(
  () => props.src,
  () => {
    isLoaded.value = false;
    hasFailed.value = false;
  },
);

/* Cached images can finish before hydration — the load event never fires. */
onMounted(() => {
  const el = imgRef.value;
  if (el?.complete) {
    if (el.naturalWidth > 0) isLoaded.value = true;
    else hasFailed.value = true;
  }
});
</script>

<style scoped>
.app-img {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--color-wash);
}
.app-img img {
  transition: opacity 0.3s var(--ease-spring);
}

/* Same shimmer as AppSkeleton so loading feels consistent app-wide. */
.app-img__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--color-shell) 25%,
    var(--color-mist) 50%,
    var(--color-shell) 75%
  );
  background-size: 200% 100%;
  animation: app-img-shimmer 1.4s ease infinite;
}
@keyframes app-img-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-img img {
    transition: none;
  }
  .app-img__shimmer {
    animation: none;
    background: var(--color-shell);
  }
}
</style>
