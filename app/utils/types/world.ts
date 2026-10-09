/** Compass directions; N is -y on the grid (toward the top of the map). */
export type Dir = "N" | "E" | "S" | "W";

export interface Vec2 {
  x: number;
  y: number;
}

export type TileKind =
  | "road"
  | "ring" // a tile of a roundabout's outer ring (drivable, walkable)
  | "roundabout" // the centre of a roundabout (decorative, blocked)
  | "plot" // a building faces the road here (blocked)
  | "yard" // block interior: trees, grass (walkable)
  | "edge" // outside the ring road (walkable greenery)
  | "kitchen"
  | "home"
  | "landmark"
  | "hub";

export interface Tile {
  x: number;
  y: number;
  kind: TileKind;
  walkable: boolean;
  drivable: boolean;
  district: string | null;
  /** For road/ring tiles: which neighbours are also drivable, N=8 E=4 S=2 W=1. */
  roadMask: number;
  /** For blocked tiles that have a door: the direction of the road they face. */
  door: Dir | null;
  /** For kitchens: the kitchen slug. For landmarks: the landmark id. */
  ref: string | null;
}

/** One static model instance in world units. */
export interface Placement {
  model: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  scale: number;
  /** Optional colour multiply (0xRRGGBB). */
  tint?: number;
}

export interface RoadNode {
  key: string;
  x: number;
  y: number;
  neighbours: string[];
}

export interface Aabb {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface LandmarkDef {
  id: string;
  name: string;
  /** Top-left tile and size in tiles. */
  x: number;
  y: number;
  w: number;
  h: number;
  district: string;
}

export interface KitchenPlacement {
  slug: string;
  x: number;
  y: number;
}

/** Commands the HUD and shop send into the running world. */
export interface WorldApi {
  walkTo(tile: Vec2): void;
  cancelWalk(): void;
  teleportHome(): void;
  setFollowRider(follow: boolean): void;
  setNightOverride(night: boolean | null): void;
  enter(): void;
}
