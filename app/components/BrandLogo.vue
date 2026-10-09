<template>
  <component
    :is="to ? NuxtLink : 'span'"
    :to="to || undefined"
    class="brand-logo"
    :class="[`brand-logo--${mode}`, `brand-logo--${tone}`]"
    :style="rootStyle"
    :aria-label="ariaLabel"
    :role="to ? undefined : 'img'"
  >
    <!-- Badge: the app-icon tile on its own (no wordmark) -->
    <span
      v-if="badge"
      class="brand-logo__tile"
      :class="`brand-logo__tile--${badgeBg}`"
      :style="tileStyle"
      aria-hidden="true"
    >
      <span
        class="brand-logo__mark"
        :style="{ ...badgeMarkStyle, background: tileMark }"
      />
    </span>

    <template v-else>
      <!-- Mark: the FP monogram. Painted via mask-image, so one asset tints
           to any tone — including currentColor. -->
      <span
        v-if="showMark"
        class="brand-logo__mark"
        :style="{ width: `${size}px`, height: `${size}px`, background: c.mark }"
        aria-hidden="true"
      />

      <!-- Wordmark: 'Food' + 'print' in the accent, Fredoka 600 -->
      <span
        v-if="showWordmark"
        class="brand-logo__wordmark"
        :style="wordmarkStyle"
        aria-hidden="true"
      >
        <span>Food</span><span :style="{ color: c.accent }">print</span>
      </span>
    </template>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

type BrandTone = "default" | "dark" | "primary" | "mono" | "role";
type BrandMode = "full" | "stacked" | "mark" | "wordmark";
type BadgeBg = "brand" | "ink" | "cream";

const props = withDefaults(
  defineProps<{
    /** Layout: full lockup, vertical stack, mark only, or wordmark only. */
    mode?: BrandMode;
    /** Colour treatment for the surface the logo sits on. */
    tone?: BrandTone;
    /** Render the app-icon tile alone (ignores mode / wordmark). */
    badge?: boolean;
    /** Tile background when badge is set. */
    badgeBg?: BadgeBg;
    /** Visual glyph height in px; wordmark + gaps scale from it. */
    size?: number;
    /** Link target; pass null to render a plain, non-navigational logo. */
    to?: string | null;
    /** Accessible name. */
    label?: string;
  }>(),
  {
    mode: "full",
    tone: "default",
    badge: false,
    badgeBg: "brand",
    size: 26,
    to: "/",
    label: "Foodprint",
  },
);

const showMark = computed(() => props.mode !== "wordmark");
const showWordmark = computed(() => props.mode !== "mark");

const ariaLabel = computed(() =>
  props.to ? `${props.label} — home` : props.label,
);

/*
 * The mark is brand orange, not primary: it's an identity mark, not an action.
 * `word` is the "Food" half; `accent` is "print".
 *
 * `role` co-brands with the surrounding flow: inside a `.role-vendor` /
 * `.role-rider` / `.role-customer` subtree the mark takes the role colour and
 * "print" its dark-safe text variant (`--role-ink`); anywhere else both fall
 * back to brand orange, so it is safe as a default treatment.
 */
const c = computed(() => {
  const color = {
    default: { mark: "var(--color-brand)", word: "var(--color-ink)", accent: "var(--color-brand)" },
    dark: { mark: "var(--color-brand)", word: "var(--color-cream)", accent: "var(--color-brand)" },
    primary: { mark: "var(--color-cream)", word: "var(--color-cream)", accent: "var(--color-cream)" },
    mono: { mark: "currentColor", word: "currentColor", accent: "currentColor" },
    role: {
      mark: "var(--role, var(--color-brand))",
      word: "var(--color-ink)",
      accent: "var(--role-ink, var(--color-brand))",
    },
  };
  return color[props.tone];
});

/* On the orange tile the mark goes cream; on ink/cream tiles it stays brand. */
const tileMark = computed(() =>
  props.badgeBg === "brand" ? "var(--color-cream)" : "var(--color-brand)",
);

const fontSize = computed(() => Math.round(props.size * 0.82));

const rootStyle = computed(() => {
  if (props.badge) return {};
  const gap = Math.round(props.size * (props.mode === "stacked" ? 0.26 : 0.3));
  return { gap: `${gap}px` };
});

const tileStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: `${Math.round(props.size * 0.26)}px`,
}));

const badgeMarkStyle = computed(() => {
  const s = Math.round(props.size * 0.66);
  return { width: `${s}px`, height: `${s}px` };
});

const wordmarkStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  color: c.value.word,
}));
</script>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  user-select: none;
  outline: none;
}

.brand-logo--stacked {
  flex-direction: column;
}

.brand-logo:focus-visible {
  border-radius: 0.5rem;
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

/*
 * `background` + `mask-image` rather than <img>: the mark inherits whatever
 * colour the tone (or currentColor) resolves to, from a single PNG.
 */
.brand-logo__mark {
  display: inline-block;
  flex: none;
  mask-image: url("/brand/fp-mark.png");
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url("/brand/fp-mark.png");
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

.brand-logo__tile {
  display: inline-grid;
  place-items: center;
  flex: none;
}

.brand-logo__tile--brand {
  background: var(--color-brand);
}

.brand-logo__tile--ink {
  background: var(--color-ink);
}

.brand-logo__tile--cream {
  background: var(--color-cream);
  border: 1.5px solid var(--color-line);
}

.brand-logo__wordmark {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--font-sans);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1;
}
</style>
