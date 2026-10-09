<template>
  <Teleport to="body">
    <Transition name="app-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] grid place-items-center bg-ink/45 p-5"
        :class="role && `role-${role}`"
        @click.self="dismiss"
      >
        <div
          class="app-modal__dialog w-full rounded-3xl border-2 border-dashed border-primary/50 bg-surface p-7 shadow-modal"
          :class="sizeClass"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div class="mb-3 flex items-start justify-between gap-4">
            <h2 class="m-0 text-[21px] font-semibold leading-tight text-ink">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              v-if="!persistent"
              type="button"
              class="grid h-8 w-8 flex-shrink-0 cursor-pointer place-items-center rounded-full border-none bg-shell text-ink-soft transition-colors hover:bg-line"
              aria-label="Close"
              @click="close"
            >
              <Icon name="close" :size="13" />
            </button>
          </div>

          <div class="text-[14.5px] leading-relaxed text-ink-soft">
            <slot />
          </div>

          <div v-if="$slots.footer" class="mt-6 flex gap-3">
            <slot name="footer" :close="close" />
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
    size?: "sm" | "md" | "lg";
    /** Blocks backdrop-click and Escape dismissal. */
    persistent?: boolean;
    /**
     * Re-applies a role accent inside the modal. It has to be a prop rather than
     * a class on the caller: the component's root is a `<Teleport>`, so the
     * dialog is mounted on `<body>` and falls outside any `.role-*` wrapper in
     * the layout — leaving a rider's modal wearing the customer's orange.
     */
    role?: "customer" | "vendor" | "rider";
  }>(),
  {
    title: undefined,
    size: "md",
    persistent: false,
    role: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

/* Shared, reference-counted — a modal opened from inside a bottom sheet must
   not unlock the page when it closes and leave the sheet floating over a
   scrolling body. */
useScrollLock(toRef(props, "modelValue"));

const sizeClass = computed(
  () => ({ sm: "max-w-sm", md: "max-w-[420px]", lg: "max-w-xl" })[props.size],
);

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const dismiss = () => {
  if (!props.persistent) close();
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.modelValue) dismiss();
};

watch(
  () => props.modelValue,
  (open) => {
    if (!import.meta.client) return;
    document.body.style.overflow = open ? "hidden" : "";
  },
);

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  if (import.meta.client) document.body.style.overflow = "";
});
</script>

<style scoped>
.app-modal-enter-active {
  transition: opacity 0.2s ease;
}
.app-modal-leave-active {
  transition: opacity 0.15s ease;
}
.app-modal-enter-from,
.app-modal-leave-to {
  opacity: 0;
}
.app-modal-enter-active .app-modal__dialog {
  animation: app-modal-in 0.3s var(--ease-spring) both;
}
@keyframes app-modal-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-modal-enter-active .app-modal__dialog {
    animation: none;
  }
}
</style>
