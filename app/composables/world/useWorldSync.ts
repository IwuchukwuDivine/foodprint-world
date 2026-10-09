import type * as THREE from "three";
import type { Ref } from "vue";
import type { useWorldStore } from "~/stores/world";
import type { City } from "~/composables/world/useCityBuilder";
import type { Player } from "~/composables/world/usePlayer";
import type { useDayNight } from "~/composables/world/useDayNight";
import { TILE } from "~/utils/world/tileMap";

/**
 * Copies world state into the Pinia store ten times a second, and only when
 * something changed. The HUD reacts to the store; the loop never touches Vue
 * per frame.
 */
export function useWorldSync(
  world: ReturnType<typeof useWorldStore>,
  city: City,
  player: Player,
  fps: Ref<number>,
  renderer: THREE.WebGLRenderer,
  dayNight: ReturnType<typeof useDayNight>,
) {
  let acc = 0;
  const DOOR_RANGE = TILE * 0.95;

  function clockLabel(): string {
    return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  }

  function update(dt: number) {
    acc += dt;
    if (acc < 0.1) return;
    acc = 0;

    const tile = player.tile();
    if (world.playerTile.x !== tile.x || world.playerTile.y !== tile.y) world.playerTile = tile;
    const district = city.grid.districtAt(tile.x, tile.y);
    if (world.district !== district) world.district = district;

    const px = player.group.position.x;
    const pz = player.group.position.z;
    let nearest: string | null = null;
    let nearestD = DOOR_RANGE;
    for (const k of city.kitchens) {
      const d = Math.hypot(k.doorPoint.x - px, k.doorPoint.z - pz);
      if (d < nearestD) {
        nearestD = d;
        nearest = k.slug;
      }
      const near = d < TILE * 2.2;
      k.labelEl.classList.toggle("world-label--near", near);
    }
    if (world.nearbyKitchen !== nearest) world.nearbyKitchen = nearest;

    const walking = player.state.autoPath ? player.state.autoTarget : null;
    if (world.walkingTo !== walking) world.walkingTo = walking;

    const homeD = Math.hypot(city.home.doorPoint.x - px, city.home.doorPoint.z - pz);
    const nearHome = homeD < TILE * 2.5;
    if (world.playerNearHome !== nearHome) world.playerNearHome = nearHome;

    const night = dayNight.night() > 0.5;
    if (world.isNight !== night) world.isNight = night;

    const clock = clockLabel();
    if (world.clock !== clock) world.clock = clock;

    if (world.fps !== fps.value) world.fps = fps.value;
    const calls = renderer.info.render.calls;
    if (world.drawCalls !== calls) world.drawCalls = calls;
  }

  return { update };
}
