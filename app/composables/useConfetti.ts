/**
 * A full-screen confetti burst for the moment food lands. `burst()` mounts its
 * own canvas on <body>, animates for ~1.8 s with gravity and removes itself.
 * Respects prefers-reduced-motion by doing nothing.
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  shape: "rect" | "circle";
}

const DURATION_MS = 1800;
const COUNT = 140;
const GRAVITY = 1400; // px/s^2

const tokenColor = (name: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export default function useConfetti() {
  function burst() {
    if (!import.meta.client) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "90",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(canvas);

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }
    ctx.scale(dpr, dpr);

    const colors = [
      tokenColor("--color-brand", "#fb6b05"),
      tokenColor("--color-gold", "#f2b84b"),
      tokenColor("--color-success", "#1e7a4c"),
      tokenColor("--color-cream", "#fff6ef"),
    ];

    const originX = width / 2;
    const originY = height * 0.55;
    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 500 + Math.random() * 700;
      return {
        x: originX + (Math.random() - 0.5) * 40,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 7,
        color: colors[i % colors.length]!,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 12,
        shape: Math.random() < 0.3 ? "circle" : "rect",
      };
    });

    const start = performance.now();
    let last = start;

    const frame = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const fade = Math.max(0, 1 - Math.max(0, elapsed - DURATION_MS * 0.6) / (DURATION_MS * 0.4));

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = fade;
      for (const p of particles) {
        p.vy += GRAVITY * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (elapsed < DURATION_MS) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }

  return { burst };
}
