<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        v-for="position in POSITIONS"
        :key="position"
        class="app-toast-stack"
        :class="`app-toast-stack--${position}`"
        role="region"
        aria-label="Notifications"
      >
        <TransitionGroup
          :name="position.startsWith('top') ? 'app-toast-top' : 'app-toast-bottom'"
          tag="ul"
          class="m-0 flex list-none flex-col gap-2.5 p-0"
        >
          <li
            v-for="toast in byPosition(position)"
            :key="toast.id"
            class="app-toast"
            :class="`app-toast--${toast.type}`"
            role="status"
            :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
          >
            <span class="app-toast__icon" aria-hidden="true">
              {{ GLYPHS[toast.type] }}
            </span>

            <span class="min-w-0">
              <span v-if="toast.title" class="block text-[13px] font-semibold leading-tight">
                {{ toast.title }}
              </span>
              <span class="block break-words text-[14.5px] font-medium leading-snug">
                {{ toast.message }}
              </span>
            </span>

            <button
              v-if="toast.action"
              type="button"
              class="app-toast__action"
              @click="runAction(toast)"
            >
              {{ toast.action.label }}
            </button>

            <button
              type="button"
              class="app-toast__close"
              aria-label="Dismiss notification"
              @click="remove(toast.id)"
            >
              <Icon name="close" :size="12" />
            </button>
          </li>
        </TransitionGroup>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Toast, ToastPosition, ToastType } from "~/utils/types/ui";

const POSITIONS: ToastPosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const GLYPHS: Record<ToastType, string> = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
};

const { toasts, remove } = useToast();

const byPosition = (position: ToastPosition) =>
  toasts.value.filter((t) => (t.position ?? "top-right") === position);

const runAction = (toast: Toast) => {
  toast.action?.onClick();
  remove(toast.id);
};
</script>

<style scoped>
.app-toast-stack {
  position: fixed;
  z-index: 120;
  pointer-events: none;
  width: min(24rem, calc(100vw - 2rem));
}
.app-toast-stack--top-left {
  top: calc(1rem + var(--top));
  left: 1rem;
}
.app-toast-stack--top-right {
  top: calc(1rem + var(--top));
  right: 1rem;
}
.app-toast-stack--bottom-left {
  bottom: calc(1.25rem + var(--bottom));
  left: 1rem;
}
.app-toast-stack--bottom-right {
  bottom: calc(1.25rem + var(--bottom));
  right: 1rem;
}
.app-toast-stack--top-right ul,
.app-toast-stack--bottom-right ul {
  align-items: flex-end;
}
.app-toast-stack--top-left ul,
.app-toast-stack--bottom-left ul {
  align-items: flex-start;
}

/* Dark pill from the design handoff */
.app-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 100%;
  padding: 14px 14px 14px 16px;
  border-radius: 999px;
  /* Inverted surface: ink flips light in dark mode, so the text must ride
     --color-background (cream-ish in light, near-black in dark), not cream. */
  background: var(--color-ink);
  color: var(--color-background);
  border: 1.5px solid transparent;
  box-shadow: var(--shadow-toast);
  pointer-events: auto;
}
.app-toast__icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
}
.app-toast--success {
  border-color: color-mix(in oklab, var(--color-success) 35%, transparent);
}
.app-toast--success .app-toast__icon {
  background: var(--color-success);
}
.app-toast--error {
  border-color: color-mix(in oklab, var(--color-danger) 40%, transparent);
}
.app-toast--error .app-toast__icon {
  background: var(--color-danger);
}
.app-toast--warning {
  border-color: color-mix(in oklab, var(--color-gold) 40%, transparent);
}
.app-toast--warning .app-toast__icon {
  background: var(--color-gold);
  color: var(--color-cream-ink);
}
.app-toast--info {
  border-color: color-mix(in oklab, var(--color-primary) 45%, transparent);
}
.app-toast--info .app-toast__icon {
  background: var(--color-primary);
}

.app-toast__action {
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0 2px 0 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink-disabled);
  cursor: pointer;
  transition: color 0.2s;
}
.app-toast__action:hover,
.app-toast__action:focus-visible {
  color: var(--color-background);
  outline: none;
}
.app-toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-ink-disabled);
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s;
}
.app-toast__close:hover {
  color: var(--color-background);
  background: color-mix(in oklab, var(--color-background) 14%, transparent);
}

/* Enter/leave — slide from the nearest edge */
.app-toast-top-enter-active,
.app-toast-bottom-enter-active {
  transition: all 0.3s var(--ease-spring);
}
.app-toast-top-leave-active,
.app-toast-bottom-leave-active {
  transition: all 0.22s ease-in;
}
.app-toast-top-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}
.app-toast-bottom-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
.app-toast-top-leave-to,
.app-toast-bottom-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
.app-toast-top-move,
.app-toast-bottom-move {
  transition: transform 0.3s var(--ease-spring);
}
@media (prefers-reduced-motion: reduce) {
  .app-toast-top-enter-active,
  .app-toast-bottom-enter-active,
  .app-toast-top-leave-active,
  .app-toast-bottom-leave-active,
  .app-toast-top-move,
  .app-toast-bottom-move {
    transition: opacity 0.15s ease;
  }
  .app-toast-top-enter-from,
  .app-toast-bottom-enter-from,
  .app-toast-top-leave-to,
  .app-toast-bottom-leave-to {
    transform: none;
  }
}
</style>
