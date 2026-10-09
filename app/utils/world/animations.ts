import * as THREE from "three";

/** Picks the first clip whose name matches any pattern, in order. */
export function pickClip(clips: THREE.AnimationClip[], patterns: RegExp[]): THREE.AnimationClip | null {
  for (const pattern of patterns) {
    const clip = clips.find((c) => pattern.test(c.name));
    if (clip) return clip;
  }
  return null;
}

export type Motion = "idle" | "walk" | "run" | "sit" | "drive";

/**
 * A small animation controller: one mixer, one action per motion, crossfades
 * between them. Kenney's mini characters ship idle / walk / sprint / sit /
 * drive clips, so the fuzzy patterns are belt and braces.
 */
export function makeAnimator(root: THREE.Object3D, clips: THREE.AnimationClip[]) {
  const mixer = new THREE.AnimationMixer(root);
  const actions = new Map<Motion, THREE.AnimationAction>();
  const sources: Record<Motion, RegExp[]> = {
    idle: [/^idle$/i, /idle/i],
    walk: [/^walk$/i, /walk/i],
    run: [/^sprint$/i, /^run$/i, /sprint|run|jog/i],
    sit: [/^sit$/i, /sit/i],
    drive: [/^drive$/i, /drive/i],
  };
  for (const motion of Object.keys(sources) as Motion[]) {
    const clip = pickClip(clips, sources[motion]);
    if (clip) actions.set(motion, mixer.clipAction(clip));
  }
  let current: Motion | null = null;

  function play(motion: Motion, timeScale = 1) {
    const next = actions.get(motion) ?? actions.get("idle");
    if (!next) return;
    next.timeScale = timeScale;
    if (current === motion) return;
    const prev = current ? actions.get(current) : null;
    next.reset().setEffectiveWeight(1).play();
    if (prev && prev !== next) prev.crossFadeTo(next, 0.18, false);
    current = motion;
  }

  function update(dt: number) {
    mixer.update(dt);
  }

  return { play, update, mixer, has: (m: Motion) => actions.has(m) };
}

export type Animator = ReturnType<typeof makeAnimator>;
