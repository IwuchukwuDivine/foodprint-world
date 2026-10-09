<template>
  <!-- eslint-disable vue/no-v-html -- trusted constant SVG strings from utils/constants/icons.ts -->
  <svg
    viewBox="0 0 24 24"
    :width.attr="size"
    :height.attr="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    :style="color ? { color } : undefined"
    aria-hidden="true"
    class="shrink-0"
    v-html="ICONS[name]"
  />
</template>

<script setup lang="ts">
import { ICONS } from "~/utils/constants/icons";
import type { IconName } from "~/utils/types/icons";

withDefaults(
  defineProps<{
    name: IconName;
    /** Any CSS color; defaults to currentColor so it inherits text color. */
    color?: string;
    size?: number | string;
  }>(),
  {
    color: undefined,
    size: 24,
  },
);
</script>
