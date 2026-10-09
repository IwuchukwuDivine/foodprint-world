import { Grid } from "~/utils/world/grid";

let grid: Grid | null = null;

/** One shared read-only Grid for the HUD (minimap, home door lookup). Built lazily. */
export default function worldGrid(): Grid {
  grid ??= new Grid();
  return grid;
}
