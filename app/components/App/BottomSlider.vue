<template>
  <Teleport to="body">
    <Transition name="app-sheet">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45"
        :class="role && `role-${role}`"
        @click.self="close"
      >
        <div
          class="app-sheet__panel w-full max-w-[520px] rounded-t-[28px] border-2 border-b-0 border-dashed border-primary/50 bg-surface pt-3.5 shadow-sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :style="{ paddingBottom: 'calc(1.75rem + var(--bottom))' }"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div
            class="mx-auto mb-3 h-[5px] w-10 rounded-full bg-shell"
            aria-hidden="true"
          />

          <div v-if="title || $slots.title" class="mb-2.5 flex items-center justify-between gap-4 px-6">
            <h2 class="m-0 text-xl font-semibold leading-tight text-ink">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              type="button"
              class="grid h-8 w-8 flex-shrink-0 cursor-pointer place-items-center rounded-full border-none bg-shell text-ink-soft transition-colors hover:bg-line"
              aria-label="Close"
              @click="close"
            >
              <Icon name="close" :size="13" />
            </button>
          </div>

          <!--
            The horizontal padding lives here, not on the panel, and the sheet
            never scrolls sideways.

            `overflow-y: auto` alone is a trap: CSS computes the *other* axis
            from `visible` to `auto`, so any child a pixel too wide hands the
            user a horizontal scrollbar. `overflow-x: clip` refuses that outright
            (unlike `hidden`, it creates no scroll container).

            Clipping happens at the *padding* box, so a full-bleed child inside
            this box — a sticky footer at `-mx-6`, a scroll rail — still reaches
            the panel's edges instead of being cut 24px short.
          -->
          <div
            ref="scrollerEl"
            class="max-h-[70dvh] overflow-y-auto overflow-x-clip px-6 text-[14.5px] text-ink-soft"
          >
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    /**
     * Re-applies a role accent inside the sheet. It has to be a prop rather than
     * a class on the caller: the component's root is a `<Teleport>`, so the panel
     * is mounted on `<body>` and falls outside any `.role-*` wrapper in the
     * layout — leaving a rider's offer sheet wearing the customer's orange.
     */
    role?: "customer" | "vendor" | "rider";
  }>(),
  {
    title: undefined,
    role: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

/* The page behind must not scroll under the sheet — least of all on iOS, where
   the body rubber-bands and drags the sheet with it. */
useScrollLock(toRef(props, "modelValue"));

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

/* Swipe-down to dismiss — but never while the user is scrolling the content.
   Scrolling back up through a long sheet is itself a downward finger drag, so
   a bare "moved 90px down" check dismissed the sheet mid-read. A drag only
   counts as a dismiss when the scroller sat at the top when the finger landed
   and is still there when it lifts (a gesture that scrolled the content leaves
   scrollTop > 0). Touches on the handle/header, outside the scroller, always
   qualify. */
const scrollerEl = ref<HTMLElement | null>(null);
let touchStartY = 0;
let touchDeltaY = 0;
let startedInScroller = false;
let scrollerWasAtTop = true;

const onTouchStart = (event: TouchEvent) => {
  touchStartY = event.touches[0]?.clientY ?? 0;
  touchDeltaY = 0;
  startedInScroller = !!scrollerEl.value?.contains(event.target as Node);
  scrollerWasAtTop = (scrollerEl.value?.scrollTop ?? 0) <= 0;
};
const onTouchMove = (event: TouchEvent) => {
  touchDeltaY = (event.touches[0]?.clientY ?? 0) - touchStartY;
};
const onTouchEnd = () => {
  const wasScrolling =
    startedInScroller
    && (!scrollerWasAtTop || (scrollerEl.value?.scrollTop ?? 0) > 0);
  if (!wasScrolling && touchDeltaY > 90) close();
};
</script>

<style scoped>
.app-sheet-enter-active {
  transition: opacity 0.25s ease;
}
.app-sheet-leave-active {
  transition: opacity 0.2s ease;
}
.app-sheet-enter-from,
.app-sheet-leave-to {
  opacity: 0;
}
.app-sheet-enter-active .app-sheet__panel {
  animation: app-sheet-up 0.34s var(--ease-spring) both;
}
.app-sheet-leave-active .app-sheet__panel {
  animation: app-sheet-up 0.2s ease reverse both;
}
@keyframes app-sheet-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-sheet-enter-active .app-sheet__panel,
  .app-sheet-leave-active .app-sheet__panel {
    animation: none;
  }
}
</style>
