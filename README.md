# Foodprint World

A playable 3D Awka in the browser. Walk the streets as a third-person character, step into one of twelve real local kitchens, browse the menu, place an order and watch a Foodprint rider bring it to your door on a motorbike, then hand it over with the delivery code.

Everything is a simulation for now: no backend, no payments, no accounts. The kitchens, menus, prices and fees are the same demo data the Foodprint app seeds, and the order moves through the same statuses the real product uses.

Live at the URL in `nuxt.config.ts` once deployed; locally it runs on http://localhost:3003.

## Run it

```bash
npm install
node scripts/fetch-kenney.mjs   # downloads the CC0 model packs into public/models (once)
npm run dev
```

`?debug` on the URL shows an fps and draw-call badge and exposes `window.__world` with the engine's internals and a `step(seconds)` helper for driving the simulation from the console.

## How it is built

- **Nuxt 4 + Tailwind v4**, the Foodprint design tokens, Fredoka and 18 kit components ported from the main app, so every sheet and HUD widget looks like Foodprint.
- **three.js** for the world: an instanced low-poly Awka built from a hand-authored tile map (`app/utils/world/tileMap.ts`) with the eight launch districts, Aroma Junction and Amawbia roundabouts, Eke Awka market, Unizik gate, Government House and Ekwueme Square.
- **Kenney CC0 packs** for roads, buildings, cars and trees (see `CREDITS.md`), a CC-BY motorbike, and Ready Player Me bodies with motion-captured idle/walk/run clips for every person, streamed at runtime.
- A **fixed-timestep game loop** drives the player, traffic, pedestrians, the rider and the order state machine; the Vue layer only sees 10 Hz snapshots through a Pinia store.
- **The order simulation** (`app/composables/world/useOrderSim.ts`) times itself off persisted timestamps, so reloading mid-delivery resumes with the rider where they should be.
- People and vehicles are solid: cars yield to anyone in front, pedestrians keep to the pavement edge and step around each other, and the player cannot walk through a bike.

## Controls

- Desktop: WASD or arrows to walk, Shift to run, E or Enter at a kitchen door, Esc to close, drag to orbit, wheel to zoom.
- Phone: joystick to walk, tap a kitchen's label to walk there, drag to look, pinch to zoom.

## Layout

```
app/
  components/World   canvas, loading screen
  components/Hud     top bar, ticker, minimap, joystick, order card, tray pill
  components/Shop    storefront, item, tray, checkout, payment, handoff, rating, history
  composables/world  renderer, assets, avatars, loop, city builder, player, camera,
                     traffic, pedestrians, rider bike, order sim, smoke, lights
  utils/world        tile map, grid, A*, road graph, placements, instancing, materials
  utils/data         the twelve kitchens and their menus
  stores             tray, order (persisted), shop, world, settings
scripts/             asset fetch and GLB inspection
public/models/       the fetched models (committed)
```
