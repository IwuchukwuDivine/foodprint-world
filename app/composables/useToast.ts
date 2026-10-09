import type { Toast, ToastType } from "~/utils/types/ui";

type ToastInput =
  | string
  | (Omit<Toast, "id" | "type"> & { type?: ToastType });

const DEFAULT_TIMEOUT = 3200;
const MAX_VISIBLE = 5;

const buildToast = (
  type: ToastType,
  input: ToastInput,
  fallbackTimeout = DEFAULT_TIMEOUT,
): Toast => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (typeof input === "string") {
    return {
      id,
      type,
      message: input,
      timeout: fallbackTimeout,
      position: "top-right",
    };
  }
  return {
    id,
    type: input.type ?? type,
    title: input.title,
    message: input.message,
    timeout: input.timeout ?? fallbackTimeout,
    position: input.position ?? "top-right",
    action: input.action,
  };
};

/**
 * App-wide toasts, rendered by <AppToast> (mounted once in the layout).
 *
 * toast.success("Order confirmed!")
 * toast.error({ message: "Payment failed", action: { label: "Retry", onClick } })
 * toast.info({ message: "Item removed", position: "bottom-left", action: { label: "Undo", onClick } })
 */
export default function useToast() {
  const toasts = useState<Toast[]>("app-toasts", () => []);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const remove = (id: string) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const push = (toast: Toast) => {
    toasts.value = [toast, ...toasts.value].slice(0, MAX_VISIBLE);
    if (import.meta.client && toast.timeout && toast.timeout > 0) {
      timers.set(
        toast.id,
        setTimeout(() => remove(toast.id), toast.timeout),
      );
    }
    return toast.id;
  };

  return {
    toasts,
    remove,
    success: (input: ToastInput) => push(buildToast("success", input)),
    error: (input: ToastInput) => push(buildToast("error", input, 5000)),
    warning: (input: ToastInput) => push(buildToast("warning", input)),
    info: (input: ToastInput) => push(buildToast("info", input)),
    clear: () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      toasts.value = [];
    },
  };
}
