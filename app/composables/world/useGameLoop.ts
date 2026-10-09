/**
 * requestAnimationFrame driver with a fixed-timestep update and a per-frame
 * render. Delta is clamped so a background tab does not teleport anything
 * when it comes back.
 */
export function useGameLoop(update: (dt: number) => void, render: (dt: number) => void) {
  const FIXED = 1 / 60;
  const MAX_SUBSTEPS = 5;
  let raf = 0;
  let last = 0;
  let accumulator = 0;
  let running = false;
  let fpsFrames = 0;
  let fpsTime = 0;
  const fps = ref(0);

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    accumulator += dt;
    let steps = 0;
    while (accumulator >= FIXED && steps < MAX_SUBSTEPS) {
      update(FIXED);
      accumulator -= FIXED;
      steps++;
    }
    if (steps === MAX_SUBSTEPS) accumulator = 0;
    render(dt);
    fpsFrames++;
    fpsTime += dt;
    if (fpsTime >= 0.5) {
      fps.value = Math.round(fpsFrames / fpsTime);
      fpsFrames = 0;
      fpsTime = 0;
    }
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (running) {
      last = performance.now();
      accumulator = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", onVisibility);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVisibility);
  }

  return { start, stop, fps };
}
