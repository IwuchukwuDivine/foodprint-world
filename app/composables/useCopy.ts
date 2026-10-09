/**
 * Copy-to-clipboard with inline feedback: `copied` flips true for `resetMs`
 * after a successful copy, so the trigger itself can say "Copied ✓" — the
 * app-wide convention is that swap, never a success toast.
 */
export function useCopy(resetMs = 1800) {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  onUnmounted(() => clearTimeout(timer));

  /** Returns false when the clipboard refused, so callers can explain. */
  async function copy(text: string): Promise<boolean> {
    if (!import.meta.client) return false;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, resetMs);
    return true;
  }

  return { copied, copy };
}
