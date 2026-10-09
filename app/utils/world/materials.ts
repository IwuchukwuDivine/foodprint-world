import * as THREE from "three";

/**
 * Kenney models share one atlas texture per pack. Tinting is a colour
 * multiply on a cloned material: a white body goes orange, dark windows stay
 * dark. The shared material is never mutated, so the rest of the city keeps
 * its colours.
 */
export function tintObject(root: THREE.Object3D, hex: number, matchName?: RegExp) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (matchName && !matchName.test(mesh.name)) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = mats.map((m) => {
      const c = (m as THREE.MeshStandardMaterial).clone();
      c.color.setHex(hex);
      return c;
    });
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0]!;
  });
}

/** Gives every mesh under root its own material so emissive can be animated. */
export function ownMaterials(root: THREE.Object3D): THREE.MeshStandardMaterial[] {
  const owned: THREE.MeshStandardMaterial[] = [];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = mats.map((m) => (m as THREE.MeshStandardMaterial).clone());
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0]!;
    owned.push(...cloned);
  });
  return owned;
}

export function setEmissive(materials: THREE.MeshStandardMaterial[], hex: number, intensity: number) {
  for (const m of materials) {
    m.emissive.setHex(hex);
    m.emissiveIntensity = intensity;
  }
}

/** A canvas-painted sign: cream text on brand orange, Fredoka. */
export function makeSignTexture(text: string, options: { bg?: string; fg?: string; icon?: string } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = options.bg ?? "#fb6b05";
  roundRect(ctx, 0, 0, 512, 128, 28);
  ctx.fill();
  ctx.fillStyle = options.fg ?? "#fff6ef";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 56;
  ctx.font = `600 ${size}px Fredoka, sans-serif`;
  while (ctx.measureText(text).width > 460 && size > 24) {
    size -= 4;
    ctx.font = `600 ${size}px Fredoka, sans-serif`;
  }
  ctx.fillText(text, 256, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** The Foodprint mark on a transparent square, for van decals. */
export async function makeDecalTexture(): Promise<THREE.Texture> {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#fff6ef";
      roundRect(ctx, 24, 24, 208, 208, 48);
      ctx.fill();
      ctx.drawImage(img, 56, 56, 144, 144);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = "/brand/fp-mark.png";
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A soft radial sprite for smoke and lamp glows. */
export function makeGlowTexture(inner = "rgba(255,255,255,0.9)", outer = "rgba(255,255,255,0)") {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Repaints a Kenney vehicle: every saturated or white swatch the mesh samples
 * becomes `hex`, scaled by the swatch's own brightness so the gradient shading
 * survives, while grey details (glass, bumpers, tyres) keep their colour. A
 * colour multiply cannot do this, because it only ever darkens.
 */
export function paintObject(root: THREE.Object3D, hex: number, matchName?: RegExp) {
  const paint = new THREE.Color(hex);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (matchName && !matchName.test(mesh.name)) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const painted = mats.map((m) => {
      const c = (m as THREE.MeshStandardMaterial).clone();
      c.onBeforeCompile = (shader) => {
        shader.uniforms.uPaint = { value: paint };
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nuniform vec3 uPaint;")
          .replace(
            "#include <map_fragment>",
            `#include <map_fragment>
            {
              vec3 c = diffuseColor.rgb;
              float mx = max(c.r, max(c.g, c.b));
              float mn = min(c.r, min(c.g, c.b));
              float sat = mx - mn;
              float lum = dot(c, vec3(0.299, 0.587, 0.114));
              if (sat > 0.12 || lum > 0.78) {
                diffuseColor.rgb = uPaint * (0.5 + 0.65 * lum);
              }
            }`,
          );
      };
      c.needsUpdate = true;
      return c;
    });
    mesh.material = Array.isArray(mesh.material) ? painted : painted[0]!;
  });
}
