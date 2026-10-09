import type { Vec2 } from "~/utils/types/world";
import { HOME } from "~/utils/world/tileMap";
import worldGrid from "~/utils/worldGrid";

/** The road tile outside the player's front door, where a walk home ends. */
export default function homeDoorTile(): Vec2 {
  const grid = worldGrid();
  const home = grid.at(HOME.x, HOME.y);
  const door = home ? grid.doorRoad(home) : null;
  return door ? { x: door.x, y: door.y } : { ...HOME };
}
