import type { Ref } from "vue";
import type { IconName } from "~/utils/types/icons";

/** A single validation rule — pass arrays of these via `:rules` on inputs. */
export type Rule = {
  rule: (value: string | number) => boolean;
  message: string;
};

/** Provided by AppForm; inputs register their validity so the form can gate submit. */
export interface FormContext {
  registerInput: (id: symbol, isValid: Ref<boolean>) => void;
  unregisterInput: (id: symbol) => void;
}

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/** Optional action rendered inside the toast pill (e.g. Undo, View). */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  /** ms before auto-dismiss; 0 disables. */
  timeout?: number;
  /** Defaults to "top-right". */
  position?: ToastPosition;
  action?: ToastAction;
}

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: IconName;
  disabled?: boolean;
}

export interface DropdownItem {
  label: string;
  value: string;
  icon?: IconName;
  danger?: boolean;
  disabled?: boolean;
}

export interface TabItem {
  label: string;
  value: string;
  icon?: IconName;
}

export interface AccordionItem {
  title: string;
  content: string;
}

export type BadgeTone = "primary" | "success" | "danger" | "gold" | "neutral";

/** One stage in AppOrderTracker — `time` renders once the stage is reached. */
export interface TrackerStage {
  label: string;
  time?: string;
}

/** Frozen line item on a receipt — mirrors order_items in DATA_MODEL.md. */
export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPriceKobo: number;
  /** Frozen order_item_options (e.g. "Extra meat +₦500"). */
  options?: { name: string; priceDeltaKobo: number }[];
}

/** One vendor section on a receipt — an order can span multiple vendors. */
export interface ReceiptVendor {
  name: string;
  items: ReceiptItem[];
}

/** Single-thumb sliders use a number; range sliders use a [min, max] tuple. */
export type SliderValue = number | [number, number];

/** Column definition for AppTable. */
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** CSS width for the column, e.g. "120px" or "20%". */
  width?: string;
  /** Hide this column below the breakpoint (sm 640px, md 768px). */
  hideBelow?: "sm" | "md";
}

export type TableSortDirection = "asc" | "desc";

/** Empty-state copy shown by AppTable when there are no rows. */
export interface TableEmpty {
  icon?: IconName;
  title: string;
  description?: string;
}

export type AlertTone = "info" | "success" | "warning" | "danger";

/**
 * Palette a promo/feature banner paints itself from. Each maps to a token in
 * the `@theme` block; AppBanner derives its gradient from that one colour.
 */
export type BannerTone =
  | "primary"
  | "success"
  | "gold"
  | "danger"
  | "customer"
  | "vendor"
  | "rider"
  | "ink";

/** One row in AppDetailList — label/value pairs on detail screens. */
export interface DetailItem {
  label: string;
  value?: string | null;
  icon?: IconName;
}

/** Emitted by AppFileUpload when a file fails client-side validation. */
export interface FileUploadReject {
  file: File;
  reason: "size" | "type" | "count";
}

/** One choice inside an AppOptionGroup — mirrors `options` in DATA_MODEL.md. */
export interface OptionChoice {
  id: string;
  name: string;
  /** Added to the item's base price when chosen; 0 renders as "Free". */
  priceDeltaKobo: number;
  available?: boolean;
}

/** One segment in AppSegmented — the sort control on the restaurants list. */
export interface SegmentOption {
  label: string;
  value: string;
  icon?: IconName;
}

/** One bar in AppBarChart. `value` is raw (kobo for money charts). */
export interface BarDatum {
  label: string;
  value: number;
}

/**
 * One bubble in an AppChatThread. Deliberately app-domain-free — the support
 * surface maps its API rows into this shape so the kit component never knows
 * what a "thread" is.
 */
export interface ChatMessage {
  id: string;
  sender: "customer" | "bot" | "agent" | "system";
  body: string;
  /** Rendered as tappable NuxtLink chips under the bubble. */
  links?: { label: string; to: string }[];
  createdAt: string;
  /** Optimistic — sent but not yet on the server. Renders dimmed. */
  pending?: boolean;
  /** Send failed — renders a "tap to retry" affordance. */
  failed?: boolean;
}

/** Signature colour an accent-bearing kit component paints itself from. */
export type AccentTone = "primary" | "success" | "gold" | "danger" | "rider";

/** Viewport-space point an AppCircleReveal irises out of. */
export interface RevealOrigin {
  x: number;
  y: number;
}

/** Row in the dev playground props tables. */
export interface DevPropRow {
  prop: string;
  type: string;
  default?: string;
  description: string;
}

/** One level of an `AppBreadcrumbs` trail. */
export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page (the last item). */
  to?: string;
}
