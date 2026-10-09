import type { Ref } from "vue";

/**
 * Freezes the page behind a full-screen overlay.
 *
 * `overflow: hidden` on the body is not enough on iOS Safari — it still
 * rubber-bands, dragging the "fixed" surface with it — so the body is *pinned*
 * at its current offset and the scroll position is restored on release.
 *
 * The count is module-scoped and shared, because overlays nest: an item sheet
 * can open a modal. Without it the modal's close would unlock the page while
 * the sheet is still up, and the body would jump back to the top under it. The
 * scroll offset is captured by the first lock and only restored by the last
 * release, so a nested overlay never moves the page.
 */
let lockCount = 0;
let lockedScrollY = 0;

function applyLock(): void {
  if (lockCount++ > 0) return;

  lockedScrollY = window.scrollY;
  const { style } = document.body;
  style.position = "fixed";
  style.top = `-${lockedScrollY}px`;
  style.insetInline = "0";
  style.overflow = "hidden";
}

function releaseLock(): void {
  if (lockCount === 0) return;
  if (--lockCount > 0) return;

  const { style } = document.body;
  style.position = "";
  style.top = "";
  style.insetInline = "";
  style.overflow = "";

  /* Reading a layout property forces the reflow that un-pinning the body needs.
     Without it the document is still zero-height when we scroll, so the browser
     clamps the target to 0 and the reader is dumped at the top of the page. */
  void document.body.offsetHeight;

  /* `main.css` sets `scroll-behavior: smooth` on <html>, which would animate the
     restore — the page visibly races back down from the top to where the reader
     already was. `behavior: "instant"` is not enough on its own: Safari ignores
     the value and falls back to the stylesheet. An inline `auto` outranks it. */
  const { style: htmlStyle } = document.documentElement;
  const previousBehavior = htmlStyle.scrollBehavior;
  htmlStyle.scrollBehavior = "auto";
  window.scrollTo(0, lockedScrollY);
  htmlStyle.scrollBehavior = previousBehavior;
}

/**
 * Locks the page while `isOpen` is true, and always releases on unmount — an
 * overlay torn down by a route change must not leave the body pinned forever.
 */
export default function useScrollLock(isOpen: Ref<boolean>) {
  if (!import.meta.client) return;

  let held = false;

  const lock = () => {
    if (held) return;
    held = true;
    applyLock();
  };

  const release = () => {
    if (!held) return;
    held = false;
    releaseLock();
  };

  watch(isOpen, (open) => (open ? lock() : release()), { immediate: true });
  onScopeDispose(release);
}
