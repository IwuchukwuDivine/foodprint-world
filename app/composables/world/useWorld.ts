import * as THREE from "three";
import type { Vec2, WorldApi } from "~/utils/types/world";
import { useRenderer } from "~/composables/world/useRenderer";
import { useAssets } from "~/composables/world/useAssets";
import { useGameLoop } from "~/composables/world/useGameLoop";
import { useDayNight } from "~/composables/world/useDayNight";
import { useFollowCamera } from "~/composables/world/useFollowCamera";
import { useInput } from "~/composables/world/useInput";
import { usePlayer } from "~/composables/world/usePlayer";
import { buildCity, type City } from "~/composables/world/useCityBuilder";
import { useWorldSync } from "~/composables/world/useWorldSync";
import { useTraffic } from "~/composables/world/useTraffic";
import { usePedestrians } from "~/composables/world/usePedestrians";
import { useSmoke } from "~/composables/world/useSmoke";
import { useNightLights } from "~/composables/world/useNightLights";
import { useRiderBike } from "~/composables/world/useRiderBike";
import { useAvatars } from "~/composables/world/useAvatars";
import { AgentRegistry } from "~/utils/world/agents";
import { useOrderSim } from "~/composables/world/useOrderSim";
import { useKitchenGlow } from "~/composables/world/useKitchenGlow";
import { useWorldStore } from "~/stores/world";
import { useSettingsStore } from "~/stores/settings";
import { useShopStore } from "~/stores/shop";
import { useOrderStore } from "~/stores/order";
import { TILE } from "~/utils/world/tileMap";

/**
 * Boots the world in order: renderer, assets, city, player, systems, loop.
 * Everything that touches `window` lives here or below, under <ClientOnly>.
 */
export function useWorld(stage: HTMLElement, labelLayer: HTMLElement) {
  const world = useWorldStore();
  const settings = useSettingsStore();
  const shop = useShopStore();
  const order = useOrderStore();
  const toast = useToast();
  // Lazy so the world boots even before the celebration module is loaded.
  const celebrate = () => import("~/composables/useConfetti").then((m) => m.default().burst()).catch(() => {});
  const ctx = useRenderer(stage, labelLayer);
  const assets = useAssets();
  const avatars = useAvatars(assets);
  const registry = new AgentRegistry();
  const input = useInput();
  const dayNight = useDayNight(ctx.scene, ctx.renderer, ctx.touch);
  const camera = useFollowCamera(ctx.camera, stage, ctx.touch);

  let city: City | null = null;
  let player: ReturnType<typeof usePlayer> | null = null;
  let sync: ReturnType<typeof useWorldSync> | null = null;
  let traffic: ReturnType<typeof useTraffic> | null = null;
  let pedestrians: ReturnType<typeof usePedestrians> | null = null;
  let smoke: ReturnType<typeof useSmoke> | null = null;
  let nightLights: ReturnType<typeof useNightLights> | null = null;
  let van: ReturnType<typeof useRiderBike> | null = null;
  let sim: ReturnType<typeof useOrderSim> | null = null;
  let glow: ReturnType<typeof useKitchenGlow> | null = null;
  let billboards: THREE.Object3D[] = [];
  let entered = false;
  let followingRider = false;
  const focus = new THREE.Vector3(13 * TILE, 0, 13 * TILE);

  // Kenney models are most of the bytes; the avatars stream in after them.
  const stopProgress = watch([assets.progress, avatars.progress], ([a, b]) => {
    world.loading.progress = a * 0.7 + b * 0.3;
  });

  function followPlayer() {
    if (!player) return;
    const p = player;
    camera.setTarget({ position: p.group.position, get heading() { return p.state.heading; } });
  }

  const api: WorldApi = {
    walkTo(tile: Vec2) {
      player?.walkTo(tile);
    },
    cancelWalk() {
      player?.cancelWalk();
    },
    teleportHome() {
      if (city && player) player.teleport(city.home.doorPoint);
    },
    setFollowRider(follow) {
      followingRider = follow && !!van && van.currentLeg() !== null && van.currentLeg() !== "waiting";
      world.followingRider = followingRider;
      if (followingRider && van) {
        const v = van.vehicle;
        camera.setTarget({ position: v.group.position, get heading() { return v.state.heading; } }, { lockOrbit: true, dist: 13, pitch: 0.62 });
      } else {
        followPlayer();
      }
    },
    setNightOverride(night) {
      settings.nightOverride = night;
      dayNight.setOverride(night);
    },
    enter() {
      if (entered || !player) return;
      entered = true;
      world.loading.entered = true;
      settings.hasEnteredBefore = true;
      input.enable(() => shop.openSheet !== null);
      ctx.renderer.domElement.focus();
    },
  };

  function walkToKitchen(slug: string) {
    if (!city || !player) return;
    const node = city.kitchens.find((k) => k.slug === slug);
    if (!node) return;
    if (player.walkTo({ x: node.doorRoad.x, y: node.doorRoad.y }, slug)) world.walkingTo = slug;
  }

  // E / Enter at a kitchen door opens its storefront.
  input.onInteract(() => {
    if (world.nearbyKitchen && shop.openSheet === null) shop.openStorefront(world.nearbyKitchen);
  });
  input.onEscape(() => {
    if (shop.openSheet) shop.close();
  });

  // The handoff sheet confirms through the store; the world reacts to the status.
  const stopHandoff = watch(
    () => order.activeOrder?.status,
    (status, prev) => {
      if (status === "delivered" && prev === "picked_up") {
        sim?.onHandoffConfirmed();
        if (followingRider) api.setFollowRider(false);
      }
    },
  );

  function update(dt: number) {
    if (!city || !player) return;
    const move = entered ? input.read() : { x: 0, y: 0, run: false, active: false };
    player.update(dt, move, camera.yaw());
    traffic?.update(dt);
    pedestrians?.update(dt);
    van?.update(dt);
    if (followingRider && van && (van.currentLeg() === "waiting" || van.currentLeg() === null)) api.setFollowRider(false);
    sim?.update(dt, world.playerNearHome);
    sync?.update(dt);
  }

  function render(dt: number) {
    if (!city || !player) return;
    player.animate(dt);
    pedestrians?.animate(dt);
    van?.animate(dt);
    smoke?.update(dt);
    glow?.update(dt, player.group.position, order.activeOrder?.status === "preparing" ? order.activeOrder.kitchenSlug : null);
    camera.update(dt, player.state.moving || followingRider);
    focus.copy(followingRider && van ? van.vehicle.group.position : player.group.position);
    dayNight.update(dt, focus);
    nightLights?.update(dayNight.night());
    for (const b of billboards) b.quaternion.copy(ctx.camera.quaternion);
    ctx.render();
  }

  const loop = useGameLoop(update, render);

  async function boot() {
    try {
      await assets.loadAll();
      await avatars.load();
      city = buildCity(assets, walkToKitchen);
      ctx.scene.add(city.root);
      city.root.traverse((o) => {
        if (o.name === "billboard") billboards.push(o);
      });
      player = usePlayer(avatars, city, ctx.scene, registry);
      camera.setColliders(city.colliders);
      followPlayer();
      traffic = useTraffic(assets, ctx.scene, city, registry, ctx.touch ? 7 : 11);
      pedestrians = usePedestrians(avatars, ctx.scene, city, registry, ctx.touch ? 10 : 16);
      smoke = useSmoke(ctx.scene, city);
      nightLights = useNightLights(ctx.scene, city.placements);
      glow = useKitchenGlow(city);
      const theVan = useRiderBike(assets, avatars, ctx.scene, city, registry, {
        reachedKitchen: () => sim?.onReachedKitchen(),
        reachedHome: () => sim?.onReachedHome(),
        returned: () => sim?.onReturned(),
      });
      van = theVan;
      sim = useOrderSim(order, shop, world, theVan, {
        setSmoke: (slug, on) => smoke?.set(slug, on),
        onDelivered: () => celebrate(),
        toast: (message) => toast.success(message),
      });
      sim.restore();
      sync = useWorldSync(world, city, player, loop.fps, ctx.renderer, dayNight);
      dayNight.setOverride(settings.nightOverride);
      world.loading.ready = true;
      loop.start();
      if (window.location.search.includes("debug")) {
        const step = (seconds: number) => {
          const n = Math.round(seconds * 60);
          for (let i = 0; i < n; i++) update(1 / 60);
          render(seconds);
        };
        (window as unknown as { __world: unknown }).__world = { city, player, camera, input, ctx, assets, avatars, registry, api, dayNight, van, traffic, order, sim, step, THREE };
      }
    } catch (err) {
      console.error("world failed to boot", err);
      world.loading.failed = true;
    }
  }

  function dispose() {
    loop.stop();
    stopProgress();
    stopHandoff();
    input.disable();
    camera.dispose();
    traffic?.dispose();
    pedestrians?.dispose();
    van?.dispose();
    player?.dispose();
    assets.dispose();
    ctx.dispose();
    billboards = [];
  }

  return { api, boot, dispose };
}
