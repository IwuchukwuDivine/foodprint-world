import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Assets } from "~/composables/world/useAssets";
import { CHARACTER_KEYS } from "~/utils/world/manifest";
import { makeAnimator, type Animator } from "~/utils/world/animations";

/**
 * Realistic humans: Ready Player Me's masculine and feminine bodies with their
 * motion-captured idle / walk / run clips, streamed from the library's public
 * GitHub repo through jsDelivr (its license allows use with RPM avatars but
 * not redistribution, so nothing is bundled). If the network says no, the
 * Kenney mini characters stand in so the world still works.
 */
const CDN = "https://cdn.jsdelivr.net/gh/readyplayerme/animation-library@master";

export type Sex = "m" | "f";

interface BodySet {
  body: GLTF;
  clips: { idle: THREE.AnimationClip; walk: THREE.AnimationClip; run: THREE.AnimationClip };
}

const SOURCES: Record<Sex, { body: string; idle: string; walk: string; run: string }> = {
  m: {
    body: `${CDN}/masculine/glb/Masculine_TPose.glb`,
    idle: `${CDN}/masculine/glb/idle/M_Standing_Idle_001.glb`,
    walk: `${CDN}/masculine/glb/locomotion/M_Walk_001.glb`,
    run: `${CDN}/masculine/glb/locomotion/M_Jog_001.glb`,
  },
  f: {
    body: `${CDN}/feminine/glb/Feminine_TPose.glb`,
    idle: `${CDN}/feminine/glb/idle/F_Standing_Idle_001.glb`,
    walk: `${CDN}/feminine/glb/locomotion/F_Walk_002.glb`,
    run: `${CDN}/feminine/glb/locomotion/F_Jog_001.glb`,
  },
};

/** RPM bodies are 1.8 m; this makes a person about two and a bit Kenney metres. */
export const HUMAN_SCALE = 1.25;
const KENNEY_SCALE = 3;

/** Outfit tints so two bodies read as a crowd. */
const OUTFIT_TINTS = [0xffffff, 0xf4d9b5, 0xcfe3ff, 0xd9f2cf, 0xffe1e1, 0xe6d8ff, 0xfff0b8, 0xcfeeed];

export interface Human {
  root: THREE.Object3D;
  animator: Animator;
  /** True when this is a Ready Player Me body (bones can be posed). */
  realistic: boolean;
  height: number;
}

export function useAvatars(assets: Assets) {
  const loader = new GLTFLoader();
  const sets: Partial<Record<Sex, BodySet>> = {};
  const ready = ref(false);
  const failed = ref(false);
  const progress = ref(0);

  async function loadSet(sex: Sex): Promise<BodySet> {
    const src = SOURCES[sex];
    const [body, idle, walk, run] = await Promise.all([
      loader.loadAsync(src.body),
      loader.loadAsync(src.idle),
      loader.loadAsync(src.walk),
      loader.loadAsync(src.run),
    ]);
    body.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        mesh.frustumCulled = false;
        const m = mesh.material as THREE.MeshStandardMaterial;
        if (m?.map) m.map.colorSpace = THREE.SRGBColorSpace;
      }
    });
    const pick = (g: GLTF, name: string) => {
      const clip = g.animations[0]!.clone();
      clip.name = name;
      return clip;
    };
    return { body, clips: { idle: pick(idle, "idle"), walk: pick(walk, "walk"), run: pick(run, "run") } };
  }

  async function load() {
    try {
      const results = await Promise.allSettled([loadSet("m"), loadSet("f")]);
      results.forEach((r, i) => {
        progress.value = (i + 1) / 2;
        if (r.status === "fulfilled") sets[i === 0 ? "m" : "f"] = r.value;
      });
      if (!sets.m && !sets.f) failed.value = true;
    } catch {
      failed.value = true;
    }
    ready.value = true;
  }

  /** A Kenney mini character, for when the realistic bodies are unavailable. */
  function fallbackHuman(index: number): Human {
    const key = CHARACTER_KEYS[index % CHARACTER_KEYS.length]!;
    const root = assets.instance(key);
    root.scale.setScalar(KENNEY_SCALE);
    root.traverse((o) => {
      o.castShadow = true;
    });
    const animator = makeAnimator(root, assets.get(key).gltf.animations);
    return { root, animator, realistic: false, height: 0.67 * KENNEY_SCALE };
  }

  /**
   * A fresh person. `index` picks the sex and outfit tint deterministically,
   * so the same pedestrian looks the same on every visit.
   */
  function createHuman(index: number, preferred?: Sex): Human {
    const sex: Sex = preferred ?? (index % 2 === 0 ? "m" : "f");
    const set = sets[sex] ?? sets.m ?? sets.f;
    if (!set) return fallbackHuman(index);
    const root = cloneSkinned(set.body.scene);
    root.scale.setScalar(HUMAN_SCALE);
    const tint = OUTFIT_TINTS[Math.floor(index / 2) % OUTFIT_TINTS.length]!;
    if (tint !== 0xffffff) {
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const m = (mesh.material as THREE.MeshStandardMaterial).clone();
        m.color.setHex(tint);
        mesh.material = m;
      });
    }
    const animator = makeAnimator(root, [set.clips.idle, set.clips.walk, set.clips.run]);
    return { root, animator, realistic: true, height: 1.84 * HUMAN_SCALE };
  }

  return { load, ready, failed, progress, createHuman };
}

export type Avatars = ReturnType<typeof useAvatars>;
