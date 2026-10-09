import * as THREE from "three";
import type { Placement } from "~/utils/types/world";
import type { Assets } from "~/composables/world/useAssets";
import type { ModelKey } from "~/utils/world/manifest";

/**
 * Turns a list of placements into one InstancedMesh per (model, submesh), so
 * the whole static city costs a few dozen draw calls instead of thousands.
 */
export function buildInstanced(placements: Placement[], assets: Assets, options: { shadows?: boolean } = {}) {
  const groups = new Map<string, Placement[]>();
  for (const p of placements) {
    const list = groups.get(p.model) ?? [];
    list.push(p);
    groups.set(p.model, list);
  }

  const root = new THREE.Group();
  root.name = "static-city";
  const matrix = new THREE.Matrix4();
  const placementMatrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const axis = new THREE.Vector3(0, 1, 0);
  const color = new THREE.Color();

  for (const [key, list] of groups) {
    const model = assets.get(key as ModelKey);
    const meshes: THREE.Mesh[] = [];
    model.gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
    });
    const anyTint = list.some((p) => p.tint !== undefined);

    for (const mesh of meshes) {
      const instanced = new THREE.InstancedMesh(mesh.geometry, mesh.material, list.length);
      instanced.name = `${key}:${mesh.name}`;
      instanced.castShadow = options.shadows ?? true;
      instanced.receiveShadow = true;
      list.forEach((p, i) => {
        position.set(p.x, p.y, p.z);
        quaternion.setFromAxisAngle(axis, p.rotY);
        scale.setScalar(p.scale);
        placementMatrix.compose(position, quaternion, scale);
        matrix.multiplyMatrices(placementMatrix, mesh.matrixWorld);
        instanced.setMatrixAt(i, matrix);
        if (anyTint) instanced.setColorAt(i, color.setHex(p.tint ?? 0xffffff));
      });
      instanced.instanceMatrix.needsUpdate = true;
      if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
      root.add(instanced);
    }
  }
  return root;
}

export function disposeGroup(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.InstancedMesh;
    if (mesh.isInstancedMesh) mesh.dispose();
  });
  root.removeFromParent();
}
