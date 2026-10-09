import type * as THREE from "three";

/**
 * Seats a Ready Player Me body on a motorbike by rotating its bones into a
 * riding pose. Mixamo-style bone names; angles in radians. Tuned by eye.
 */
export interface RidePose {
  spine: number;
  thigh: number;
  thighSpread: number;
  knee: number;
  upperArm: number;
  armSpread: number;
  forearm: number;
  head: number;
}

export const DEFAULT_RIDE_POSE: RidePose = {
  spine: 0.28,
  thigh: -1.45,
  thighSpread: 0.28,
  knee: 1.5,
  upperArm: -0.95,
  armSpread: 0.35,
  forearm: 0.45,
  head: -0.2,
};

export function applyRidePose(root: THREE.Object3D, pose: RidePose = DEFAULT_RIDE_POSE) {
  const bone = (name: string) => root.getObjectByName(name);
  const set = (name: string, x: number, y = 0, z = 0) => {
    const b = bone(name);
    if (b) b.rotation.set(x, y, z);
  };
  set("Spine", pose.spine * 0.5);
  set("Spine1", pose.spine * 0.5);
  set("Spine2", pose.spine * 0.3);
  set("Head", pose.head);
  set("LeftUpLeg", pose.thigh, 0, pose.thighSpread);
  set("RightUpLeg", pose.thigh, 0, -pose.thighSpread);
  set("LeftLeg", pose.knee);
  set("RightLeg", pose.knee);
  set("LeftFoot", -0.3);
  set("RightFoot", -0.3);
  set("LeftArm", pose.upperArm, 0, pose.armSpread);
  set("RightArm", pose.upperArm, 0, -pose.armSpread);
  set("LeftForeArm", 0, pose.forearm, 0);
  set("RightForeArm", 0, -pose.forearm, 0);
  set("LeftShoulder", 0, 0, 0);
  set("RightShoulder", 0, 0, 0);
}
