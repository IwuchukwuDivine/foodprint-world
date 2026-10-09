<template>
  <div class="app-otp-display" :class="`app-otp-display--${variant}`">
    <span class="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
      {{ label }}
    </span>

    <div
      class="flex items-center gap-2.5"
      role="img"
      :aria-label="`${label}: ${digits.join(' ')}`"
    >
      <span
        v-for="(digit, i) in digits"
        :key="i"
        class="app-otp-display__box"
        aria-hidden="true"
      >
        {{ digit }}
      </span>
    </div>

    <p v-if="caption" class="app-otp-display__caption">{{ caption }}</p>

    <AppButton
      v-if="copyable"
      size="sm"
      variant="ghost"
      :icon="copied ? 'check' : 'copy'"
      @click="copyCode"
    >
      {{ copied ? "Copied" : "Copy code" }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** The handoff code, e.g. orders.delivery_otp. */
    code: string;
    label?: string;
    copyable?: boolean;
    /** `boxed` wraps the digits in the dashed card the tracking screen uses. */
    variant?: "plain" | "boxed";
    /** Reassurance line under the digits — boxed variant only. */
    caption?: string;
  }>(),
  {
    label: "Delivery code",
    copyable: true,
    variant: "plain",
    caption: undefined,
  },
);

const toast = useToast();
const { copied, copy } = useCopy();

const digits = computed(() => props.code.split(""));

const copyCode = async () => {
  if (!(await copy(props.code))) {
    toast.error("Couldn't copy — long-press the code instead");
  }
};
</script>

<style scoped>
.app-otp-display {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* Boxed — the tracking screen's "give this to your rider" card. The dashed
   border reads as a coupon: something to be handed over, not just displayed. */
.app-otp-display--boxed {
  display: flex;
  width: 100%;
  padding: 18px;
  border: 2px dashed var(--color-primary);
  border-radius: 20px;
  background: var(--color-wash);
  gap: 12px;
}

.app-otp-display__box {
  display: grid;
  place-items: center;
  width: 56px;
  height: 68px;
  border: 1.5px solid var(--color-primary);
  border-radius: 14px;
  background: var(--color-wash);
  font-size: 30px;
  font-weight: 600;
  color: var(--color-ink);
  user-select: text;
}
/* Inside the cream card the cells need to invert to stay legible. */
.app-otp-display--boxed .app-otp-display__box {
  background: var(--color-surface);
}

.app-otp-display__caption {
  margin: 0;
  max-width: 34ch;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-ink-muted);
  text-align: center;
}

@media (max-width: 400px) {
  .app-otp-display__box {
    width: 48px;
    height: 60px;
    font-size: 26px;
  }
}
</style>
