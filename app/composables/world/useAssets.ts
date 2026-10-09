import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { MODEL_KEYS, modelUrl, type ModelKey } from "~/utils/world/manifest";

export interface LoadedModel {
  key: ModelKey;
  gltf: GLTF;
  /** Local-space bounds of the unscaled model. */
  box: THREE.Box3;
  size: THREE.Vector3;
}

/**
 * One loader, one manager, one registry. Kenney GLBs are plain glTF 2.0
 * binaries (no Draco, no meshopt), so no decoder is registered. Progress is a
 * plain ref the loading screen reads.
 */
export function useAssets() {
  const progress = ref(0);
  const loaded = ref(0);
  const total = MODEL_KEYS.length;
  const registry = new Map<ModelKey, LoadedModel>();

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, done, all) => {
    progress.value = Math.min(1, done / Math.max(all, total));
    loaded.value = done;
  };
  const loader = new GLTFLoader(manager);

  async function loadOne(key: ModelKey): Promise<LoadedModel> {
    const gltf = await loader.loadAsync(modelUrl(key));
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material?.map) material.map.colorSpace = THREE.SRGBColorSpace;
      }
    });
    const box = new THREE.Box3().setFromObject(scene);
    const model: LoadedModel = { key, gltf, box, size: box.getSize(new THREE.Vector3()) };
    registry.set(key, model);
    return model;
  }

  async function loadAll() {
    await Promise.all(MODEL_KEYS.map((key) => loadOne(key)));
    progress.value = 1;
  }

  function get(key: ModelKey): LoadedModel {
    const model = registry.get(key);
    if (!model) throw new Error(`model not loaded: ${key}`);
    return model;
  }

  /** A fresh copy safe to add to the scene. Skinned models need SkeletonUtils. */
  function instance(key: ModelKey): THREE.Object3D {
    const model = get(key);
    const isSkinned = model.gltf.animations.length > 0;
    return isSkinned ? cloneSkinned(model.gltf.scene) : model.gltf.scene.clone(true);
  }

  function dispose() {
    for (const model of registry.values()) {
      model.gltf.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          (m as THREE.MeshStandardMaterial).map?.dispose();
          m.dispose();
        }
      });
    }
    registry.clear();
  }

  return { progress, loaded, total, loadAll, get, instance, dispose };
}

export type Assets = ReturnType<typeof useAssets>;
