import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export const isTouchDevice = () =>
  import.meta.client && window.matchMedia("(pointer: coarse)").matches;

/**
 * The WebGL renderer, the HTML label renderer that sits over it, the camera
 * and resize handling. Everything else in the world gets these by reference.
 */
export function useRenderer(stage: HTMLElement, labelLayer: HTMLElement) {
  const touch = isTouchDevice();
  const renderer = new THREE.WebGLRenderer({
    antialias: !touch,
    powerPreference: "high-performance",
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, touch ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);
  renderer.domElement.tabIndex = 0;

  const labels = new CSS2DRenderer({ element: labelLayer });

  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 260);
  const scene = new THREE.Scene();

  function resize() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    labels.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  function render() {
    renderer.render(scene, camera);
    labels.render(scene, camera);
  }

  function dispose() {
    observer.disconnect();
    renderer.dispose();
    renderer.domElement.remove();
  }

  return { renderer, labels, camera, scene, touch, render, resize, dispose };
}

export type RendererCtx = ReturnType<typeof useRenderer>;
