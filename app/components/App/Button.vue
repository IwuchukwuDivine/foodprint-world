<template>
  <component
    :is="tag"
    v-bind="bindings"
    class="app-btn"
    :class="[
      `app-btn--${variant}`,
      sizeClasses,
      block ? 'w-full' : '',
      icon && !$slots.default ? 'app-btn--icon-only' : '',
      loading ? 'app-btn--loading' : '',
    ]"
    :disabled="isNativeButton ? disabled || loading : undefined"
    :aria-busy="loading || undefined"
  >
    <span
      v-if="icon && iconPosition === 'leading'"
      class="inline-flex items-center"
      :class="loading ? 'opacity-0' : ''"
    >
      <Icon :name="icon" :size="iconSize" />
    </span>

    <span
      v-if="$slots.default"
      class="inline-flex items-center"
      :class="loading ? 'opacity-0' : ''"
    >
      <slot />
    </span>

    <span
      v-if="icon && iconPosition === 'trailing'"
      class="inline-flex items-center"
      :class="loading ? 'opacity-0' : ''"
    >
      <Icon :name="icon" :size="iconSize" />
    </span>

    <span
      v-if="loading"
      class="absolute inset-0 inline-flex items-center justify-center"
    >
      <span class="app-btn__spinner" />
    </span>
  </component>
</template>

<script setup lang="ts">
import type { IconName } from "~/utils/types/icons";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "inverse";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    to?: string;
    href?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    icon?: IconName;
    iconPosition?: "leading" | "trailing";
  }>(),
  {
    variant: "primary",
    size: "md",
    to: undefined,
    href: undefined,
    type: "button",
    disabled: false,
    loading: false,
    block: false,
    icon: undefined,
    iconPosition: "leading",
  },
);

const tag = computed(() => {
  if (props.to) return resolveComponent("NuxtLink");
  if (props.href) return "a";
  return "button";
});

const isNativeButton = computed(() => !props.to && !props.href);

const bindings = computed(() => {
  if (props.to) return { to: props.to };
  if (props.href)
    return { href: props.href, target: "_blank", rel: "noopener noreferrer" };
  return { type: props.type };
});

const sizeClasses = computed(
  () =>
    ({
      sm: "h-9 px-4 text-[13px] gap-1.5",
      md: "h-11 px-6 text-[15px] gap-2",
      lg: "h-13 px-8 text-[17px] gap-2.5",
    })[props.size],
);

const iconSize = computed(() => ({ sm: 15, md: 17, lg: 19 })[props.size]);
</script>

<style scoped>
.app-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  outline: none;
  border: none;
  transition:
    background-color 0.2s var(--ease-spring),
    border-color 0.2s var(--ease-spring),
    color 0.2s var(--ease-spring),
    transform 0.2s var(--ease-spring);
}
.app-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.app-btn:active {
  transform: scale(0.97);
}
/* Loading keeps its variant colors (per the design handoff) — only true
   disabled goes to the muted shell look. */
.app-btn:disabled {
  cursor: not-allowed;
  transform: none;
}
.app-btn:disabled:not(.app-btn--loading) {
  background: var(--color-shell);
  color: var(--color-ink-faint);
  border-color: transparent;
}

.app-btn--icon-only {
  aspect-ratio: 1;
  padding: 0;
}

.app-btn--primary {
  background: var(--color-primary);
  color: var(--color-cream);
}
.app-btn--primary:hover:not(:disabled) {
  background: var(--color-primary-deep);
}

.app-btn--secondary {
  background: transparent;
  border: 1.5px solid color-mix(in oklab, var(--color-ink) 18%, transparent);
  color: var(--color-ink);
  font-weight: 500;
}
.app-btn--secondary:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary-deep);
}
.app-btn--secondary:disabled {
  background: transparent;
  border-color: var(--color-line-soft);
}

.app-btn--ghost {
  background: transparent;
  color: var(--color-primary-deep);
}
.app-btn--ghost:hover:not(:disabled) {
  background: var(--color-wash);
}
.app-btn--ghost:disabled {
  background: transparent;
}

.app-btn--danger {
  background: var(--color-danger);
  color: #fff;
}
.app-btn--danger:hover:not(:disabled) {
  background: var(--color-danger-deep);
}

/* For buttons sitting on a brand colour or a photo — AppBanner, hero sections.
 * `secondary` is transparent with ink text, so it disappears on those.
 * The fill stays cream in BOTH themes (the surface under it is a photo or a
 * brand colour, not the page), so the text must be cream's static ink partner
 * — var(--color-ink) here goes light in dark mode and vanishes. */
.app-btn--inverse {
  background: var(--color-cream);
  color: var(--color-cream-ink);
}
.app-btn--inverse:hover:not(:disabled) {
  background: color-mix(in oklab, var(--color-cream), white 60%);
}
.app-btn--inverse:disabled {
  background: var(--color-cream);
  opacity: 0.6;
}

/* Always a near-black button, in both themes — hence the static pair. */
.app-btn--dark {
  background: var(--color-cream-ink);
  color: var(--color-cream);
}
.app-btn--dark:hover:not(:disabled) {
  background: #34261f;
}

.app-btn__spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgb(255 246 239 / 0.4);
  border-top-color: currentColor;
  animation: app-btn-spin 0.7s linear infinite;
}
@keyframes app-btn-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-btn {
    transition: none;
  }
}
</style>
