/**
 * Keyboard and joystick, merged into one movement vector. The joystick is a
 * shared ref the HUD writes into; the loop reads it without events.
 */
export interface JoystickState {
  x: number;
  y: number;
  magnitude: number;
}

const joystick = reactive<JoystickState>({ x: 0, y: 0, magnitude: 0 });
const keys = new Set<string>();
const interactListeners = new Set<() => void>();
const escapeListeners = new Set<() => void>();
let enabled = false;
let blocked = () => false;

function onKeyDown(e: KeyboardEvent) {
  if (!enabled || blocked()) return;
  const target = e.target as HTMLElement | null;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
  const k = e.key.toLowerCase();
  if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
    keys.add(k);
    e.preventDefault();
  }
  if (k === "e" || k === "enter") {
    e.preventDefault();
    interactListeners.forEach((fn) => fn());
  }
  if (k === "escape") escapeListeners.forEach((fn) => fn());
}

function onKeyUp(e: KeyboardEvent) {
  keys.delete(e.key.toLowerCase());
}

function onBlur() {
  keys.clear();
}

export function useInput() {
  function enable(isBlocked: () => boolean) {
    if (enabled) return;
    enabled = true;
    blocked = isBlocked;
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  }

  function disable() {
    enabled = false;
    keys.clear();
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  }

  /** Movement intent in screen space: x right, y forward (up on screen), length 0..1. Plus run flag. */
  function read(): { x: number; y: number; run: boolean; active: boolean } {
    if (blocked()) return { x: 0, y: 0, run: false, active: false };
    let x = 0;
    let y = 0;
    if (keys.has("w") || keys.has("arrowup")) y += 1;
    if (keys.has("s") || keys.has("arrowdown")) y -= 1;
    if (keys.has("d") || keys.has("arrowright")) x += 1;
    if (keys.has("a") || keys.has("arrowleft")) x -= 1;
    let run = keys.has("shift");
    if (x === 0 && y === 0 && joystick.magnitude > 0) {
      x = joystick.x;
      y = joystick.y;
      run = joystick.magnitude > 0.85;
    }
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y, run, active: len > 0.001 };
  }

  function onInteract(fn: () => void) {
    interactListeners.add(fn);
    return () => interactListeners.delete(fn);
  }

  function onEscape(fn: () => void) {
    escapeListeners.add(fn);
    return () => escapeListeners.delete(fn);
  }

  return { joystick, enable, disable, read, onInteract, onEscape };
}
