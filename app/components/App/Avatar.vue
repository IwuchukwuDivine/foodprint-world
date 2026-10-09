<template>
  <span class="relative inline-flex flex-shrink-0" :style="{ width: px, height: px }">
    <!-- A plain <img>, deliberately: avatars are 32–64px circles from hosts we
         don't control (Google's lh3.googleusercontent.com, etc.), so routing
         them through ipx buys nothing and its domain allowlist refuses them.
         no-referrer because Google's avatar CDN 403s referred requests; a URL
         that fails to load falls back to initials rather than a broken glyph. -->
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name"
      referrerpolicy="no-referrer"
      class="h-full w-full rounded-full object-cover"
      @error="failed = true"
    >
    <span
      v-else
      class="grid h-full w-full place-items-center rounded-full font-semibold text-cream"
      :style="{ background: bgColor, fontSize: initialsSize }"
      :aria-label="name"
    >
      {{ initials }}
    </span>

    <span
      v-if="presence"
      class="absolute bottom-0 right-0 h-[13px] w-[13px] rounded-full border-[2.5px] border-background"
      :class="presence === 'online' ? 'bg-success' : 'bg-ink-disabled'"
      :aria-label="presence"
      role="img"
    />
  </span>
</template>

<script setup lang="ts">
type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, number> = { sm: 32, md: 40, lg: 48, xl: 64 };
/** Brand palette rotation for initials backgrounds (from the design handoff). */
const COLORS = ["#DD5E04", "#1E7A4C", "#B54D03", "#3c2f27", "#8a776b"];

const props = withDefaults(
  defineProps<{
    name: string;
    src?: string;
    size?: Size;
    presence?: "online" | "offline";
  }>(),
  {
    src: undefined,
    size: "md",
    presence: undefined,
  },
);

const failed = ref(false);
watch(() => props.src, () => {
  failed.value = false;
});

const px = computed(() => `${SIZES[props.size]}px`);
const initialsSize = computed(() => `${Math.round(SIZES[props.size] * 0.38)}px`);

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join(""),
);

const bgColor = computed(() => {
  let hash = 0;
  for (const ch of props.name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return COLORS[hash % COLORS.length];
});
</script>
