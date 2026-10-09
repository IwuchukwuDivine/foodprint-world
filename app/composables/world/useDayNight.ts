import * as THREE from "three";
import { sunStateAt, mixSunStates, lagosHour, type SunState } from "~/utils/world/sun";

/**
 * Sun, sky, fog and exposure, driven by real Lagos time unless overridden.
 * The override blends in over two seconds instead of snapping.
 */
export function useDayNight(scene: THREE.Scene, renderer: THREE.WebGLRenderer, touch: boolean) {
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  const extent = 34;
  sun.shadow.camera.left = -extent;
  sun.shadow.camera.right = extent;
  sun.shadow.camera.top = extent;
  sun.shadow.camera.bottom = -extent;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  const hemi = new THREE.HemisphereLight(0xbfe0ff, 0xc9b89a, 0.75);
  scene.add(hemi);

  const fog = new THREE.Fog(0xd8ecff, 70, 170);
  scene.fog = fog;

  // A big inverted dome with a vertical gradient: cheap and eye-catching.
  const skyGeometry = new THREE.SphereGeometry(240, 24, 12);
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(0x4f8fe6) },
      bottom: { value: new THREE.Color(0xcfe8ff) },
    },
    vertexShader: `
      varying float vY;
      void main() {
        vY = normalize(position).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 top; uniform vec3 bottom; varying float vY;
      void main() {
        float t = smoothstep(-0.05, 0.6, vY);
        gl_FragColor = vec4(mix(bottom, top, t), 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  sky.name = "sky";
  scene.add(sky);

  let override: boolean | null = null;
  let blend = 0; // 0 = real time, 1 = override fully applied
  let current: SunState = sunStateAt(lagosHour());
  const tmpColor = new THREE.Color();

  function setOverride(value: boolean | null) {
    override = value;
  }

  function apply(state: SunState, focus: THREE.Vector3) {
    sun.position.set(focus.x + state.sunX * 60, focus.y + state.sunY * 60, focus.z + state.sunZ * 60);
    sun.target.position.copy(focus);
    sun.target.updateMatrixWorld();
    sun.intensity = state.sunIntensity;
    sun.color.setHex(state.sunColor);
    hemi.color.setHex(state.hemiSky);
    hemi.groundColor.setHex(state.hemiGround);
    hemi.intensity = state.hemiIntensity;
    (skyMaterial.uniforms.top!.value as THREE.Color).setHex(state.skyTop);
    (skyMaterial.uniforms.bottom!.value as THREE.Color).setHex(state.skyBottom);
    fog.color.setHex(state.fog);
    scene.background = tmpColor.setHex(state.fog).clone();
    renderer.toneMappingExposure = state.exposure;
    sky.position.copy(focus);
  }

  /** Call once per rendered frame with the point the shadows should hug. */
  function update(dt: number, focus: THREE.Vector3) {
    const target = override === null ? 0 : 1;
    blend += (target - blend) * Math.min(1, dt * 1.5);
    const real = sunStateAt(lagosHour());
    const forced = sunStateAt(override ? 0 : 12);
    current = mixSunStates(real, forced, blend);
    apply(current, focus);
  }

  const night = () => current.night;

  return { update, setOverride, night, sun };
}
