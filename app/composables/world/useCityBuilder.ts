import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { Aabb, Placement, Tile } from "~/utils/types/world";
import type { Kitchen } from "~/utils/types/shop";
import type { Assets } from "~/composables/world/useAssets";
import type { ModelKey } from "~/utils/world/manifest";
import { Grid } from "~/utils/world/grid";
import { TILE, LANDMARKS, HOME, RIDER_HUB, KITCHEN_PLACEMENTS } from "~/utils/world/tileMap";
import { buildStaticPlacements, DOOR_ROT, type Measure } from "~/utils/world/placements";
import { buildInstanced } from "~/utils/world/instancing";
import { ownMaterials, makeSignTexture } from "~/utils/world/materials";
import { KITCHEN_BY_SLUG } from "~/utils/data/kitchens";
import { tileNoise, pick } from "~/utils/world/seededRandom";

export interface KitchenNode {
  slug: string;
  kitchen: Kitchen;
  tile: Tile;
  doorTile: Tile;
  doorRoad: Tile;
  group: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
  label: CSS2DObject;
  labelEl: HTMLElement;
  /** Where chimney smoke rises from. */
  chimney: THREE.Vector3;
  /** Where the player stands to be "at the door". */
  doorPoint: THREE.Vector3;
}

export interface PlaceNode {
  tile: Tile;
  doorRoad: Tile;
  doorPoint: THREE.Vector3;
  group: THREE.Group;
}

export interface City {
  grid: Grid;
  root: THREE.Group;
  kitchens: KitchenNode[];
  home: PlaceNode;
  hub: PlaceNode;
  colliders: Aabb[];
  placements: Placement[];
}

const LANDMARK_MODELS: Record<string, ModelKey[]> = {
  "unizik-gate": ["commercial/building-skyscraper-a", "commercial/building-g", "commercial/building-c", "commercial/building-skyscraper-e"],
  "eke-awka-market": ["commercial/building-d", "commercial/building-b", "commercial/building-e", "commercial/building-a"],
  "ekwueme-square": ["nature/tree_palmDetailedTall", "nature/tree_palmDetailedTall", "nature/tree_palmDetailedTall", "nature/tree_palmDetailedTall"],
  "government-house": ["commercial/building-f", "commercial/building-f", "commercial/building-h", "commercial/building-h"],
  "temp-site-campus": ["commercial/building-skyscraper-e", "commercial/building-c", "commercial/building-g", "commercial/building-b"],
};

/** Where the player stands at a door: just outside the tile, on the road side. */
function doorPointFor(tile: Tile, grid: Grid): THREE.Vector3 {
  const road = grid.doorRoad(tile)!;
  const tx = tile.x * TILE;
  const tz = tile.y * TILE;
  const rx = road.x * TILE;
  const rz = road.y * TILE;
  // 70% of the way from the building centre to the road centre.
  return new THREE.Vector3(tx + (rx - tx) * 0.72, 0, tz + (rz - tz) * 0.72);
}

function aabbForTile(tile: { x: number; y: number }, inset = 0.15): Aabb {
  const half = TILE / 2 - inset;
  return {
    minX: tile.x * TILE - half,
    maxX: tile.x * TILE + half,
    minZ: tile.y * TILE - half,
    maxZ: tile.y * TILE + half,
  };
}

/**
 * Builds the static city (instanced), then the special buildings (kitchens,
 * home, hub, landmarks) as individual groups so they can glow, carry signs
 * and labels, and be looked up by tile.
 */
export function buildCity(assets: Assets, onLabelClick: (slug: string) => void): City {
  const grid = new Grid();
  const root = new THREE.Group();
  root.name = "city";

  const measure: Measure = (key) => {
    const m = assets.get(key as ModelKey);
    return { w: m.size.x, d: m.size.z, h: m.size.y };
  };

  // Ground: one big warm-green plane under the whole map and beyond.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(TILE * 90, TILE * 90),
    new THREE.MeshStandardMaterial({ color: 0x8fc472, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(13.5 * TILE, -0.05, 13.5 * TILE);
  ground.receiveShadow = true;
  root.add(ground);

  const placements = buildStaticPlacements(grid, measure);
  root.add(buildInstanced(placements, assets));

  const colliders: Aabb[] = [];
  for (const tile of grid.tiles) {
    if (!tile.walkable) colliders.push(aabbForTile(tile, tile.kind === "roundabout" ? -0.6 : 0.2));
  }

  const kitchens: KitchenNode[] = [];
  for (const placement of KITCHEN_PLACEMENTS) {
    const kitchen = KITCHEN_BY_SLUG[placement.slug];
    const tile = grid.at(placement.x, placement.y);
    if (!kitchen || !tile || !tile.door) continue;
    const doorRoad = grid.doorRoad(tile)!;
    const group = new THREE.Group();
    const model = assets.instance(kitchen.model as ModelKey);
    const m = measure(kitchen.model);
    const scale = Math.min(TILE, 3.7 / Math.max(m.w, m.d));
    model.scale.setScalar(scale);
    group.add(model);
    group.position.set(tile.x * TILE, 0, tile.y * TILE);
    group.rotation.y = DOOR_ROT[tile.door];
    const materials = ownMaterials(model);

    // Signboard above the door, facing the road.
    // Text on the front, plain orange on the back, so it never reads mirrored.
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.8),
      new THREE.MeshBasicMaterial({ map: makeSignTexture(kitchen.name), transparent: true, side: THREE.FrontSide }),
    );
    const height = m.h * scale;
    sign.position.set(0, Math.min(height + 0.55, 6.2), (m.d * scale) / 2 + 0.08);
    group.add(sign);
    const signBack = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xfb6b05, side: THREE.FrontSide }),
    );
    signBack.position.copy(sign.position);
    signBack.position.z -= 0.02;
    signBack.rotation.y = Math.PI;
    group.add(signBack);
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x3b2d22 }),
    );
    post.position.set(0, sign.position.y - 0.6, sign.position.z);
    group.add(post);

    // Awning for restaurants, a planter for home cooks: a little life at the door.
    if (kitchen.vendorType === "restaurant") {
      const awning = assets.instance("commercial/detail-awning-wide");
      awning.scale.setScalar(TILE * 0.9);
      awning.position.set(0, 1.9, (m.d * scale) / 2 - 0.05);
      group.add(awning);
    } else {
      const planter = assets.instance("suburban/planter");
      planter.scale.setScalar(TILE * 0.8);
      planter.position.set(1.1, 0, (m.d * scale) / 2 + 0.5);
      group.add(planter);
    }

    // Floating HTML label.
    const labelEl = document.createElement("button");
    labelEl.type = "button";
    labelEl.className = "world-label" + (kitchen.storeState !== "open" ? " world-label--closed" : "");
    labelEl.innerHTML = `<span class="world-label__dot"></span><span>${kitchen.name}</span><span class="world-label__rating">★ ${kitchen.ratingAvg.toFixed(1)}</span>`;
    labelEl.addEventListener("click", (e) => {
      e.stopPropagation();
      onLabelClick(kitchen.slug);
    });
    const label = new CSS2DObject(labelEl);
    label.position.set(0, height + 1.6, 0);
    group.add(label);

    root.add(group);
    kitchens.push({
      slug: kitchen.slug,
      kitchen,
      tile,
      doorTile: doorRoad,
      doorRoad,
      group,
      materials,
      label,
      labelEl,
      chimney: new THREE.Vector3(tile.x * TILE - 0.6, height + 0.2, tile.y * TILE - 0.6),
      doorPoint: doorPointFor(tile, grid),
    });
  }

  // Home: a friendly suburban house with a fence and a path.
  const homeTile = grid.at(HOME.x, HOME.y)!;
  const homeGroup = new THREE.Group();
  const house = assets.instance("suburban/building-type-c");
  const hm = measure("suburban/building-type-c");
  house.scale.setScalar(Math.min(TILE, 3.4 / Math.max(hm.w, hm.d)));
  homeGroup.add(house);
  const homeSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.7),
    new THREE.MeshBasicMaterial({ map: makeSignTexture("Your place", { bg: "#1e7a4c" }), transparent: true, side: THREE.DoubleSide }),
  );
  homeSign.position.set(homeTile.x * TILE, hm.h * house.scale.x + 0.9, homeTile.y * TILE);
  homeSign.name = "billboard";
  root.add(homeSign);
  homeGroup.position.set(homeTile.x * TILE, 0, homeTile.y * TILE);
  homeGroup.rotation.y = DOOR_ROT[homeTile.door ?? "S"];
  root.add(homeGroup);
  const home: PlaceNode = { tile: homeTile, doorRoad: grid.doorRoad(homeTile)!, doorPoint: doorPointFor(homeTile, grid), group: homeGroup };

  // Rider hub: a marked lot with cones.
  const hubTile = grid.at(RIDER_HUB.x, RIDER_HUB.y)!;
  const hubGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const cone = assets.instance("roads/construction-cone");
    cone.scale.setScalar(TILE);
    cone.position.set(-1.4 + i * 1.4, 0, 1.4);
    hubGroup.add(cone);
  }
  const hubSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 0.7),
    new THREE.MeshBasicMaterial({ map: makeSignTexture("Rider hub", { bg: "#d98a2b" }), transparent: true, side: THREE.DoubleSide }),
  );
  hubSign.position.set(hubTile.x * TILE, 2.6, hubTile.y * TILE);
  hubSign.name = "billboard";
  root.add(hubSign);
  hubGroup.position.set(hubTile.x * TILE, 0, hubTile.y * TILE);
  root.add(hubGroup);
  const hub: PlaceNode = { tile: hubTile, doorRoad: grid.doorRoad(hubTile)!, doorPoint: doorPointFor(hubTile, grid), group: hubGroup };

  // Landmarks: small clusters with a name sign.
  for (const landmark of LANDMARKS) {
    const models = LANDMARK_MODELS[landmark.id] ?? [];
    let i = 0;
    for (let dy = 0; dy < landmark.h; dy++) {
      for (let dx = 0; dx < landmark.w; dx++) {
        const key = models[i++ % models.length];
        if (!key) continue;
        const obj = assets.instance(key);
        const mm = measure(key);
        const isTree = key.startsWith("nature/");
        obj.scale.setScalar(isTree ? TILE : Math.min(TILE, 3.6 / Math.max(mm.w, mm.d)));
        const tile = grid.at(landmark.x + dx, landmark.y + dy)!;
        obj.position.set(tile.x * TILE, 0, tile.y * TILE);
        obj.rotation.y = tile.door ? DOOR_ROT[tile.door] : pick([0, Math.PI / 2, Math.PI], tileNoise(tile.x, tile.y));
        root.add(obj);
      }
    }
    const cx = (landmark.x + (landmark.w - 1) / 2) * TILE;
    const cz = (landmark.y + (landmark.h - 1) / 2) * TILE;
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 1),
      new THREE.MeshBasicMaterial({ map: makeSignTexture(landmark.name, { bg: "#01041b" }), transparent: true, side: THREE.DoubleSide }),
    );
    sign.position.set(cx, landmark.id === "ekwueme-square" ? 2.2 : 7.4, cz);
    root.add(sign);
    (sign as THREE.Mesh & { isBillboard?: boolean }).isBillboard = true;
    sign.name = "billboard";
  }

  return { grid, root, kitchens, home, hub, colliders, placements };
}
