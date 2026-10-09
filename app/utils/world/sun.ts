/**
 * Pure day/night maths. Hour fraction in [0, 24) to the lighting the scene
 * should show, by linear interpolation between five keyframes.
 */
export interface SunState {
  /** Unit direction FROM the scene TO the sun. */
  sunX: number;
  sunY: number;
  sunZ: number;
  sunIntensity: number;
  sunColor: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  skyTop: number;
  skyBottom: number;
  fog: number;
  exposure: number;
  /** 0 by day, 1 at night: window and lamp glow. */
  night: number;
}

interface Key {
  hour: number;
  state: SunState;
}

const KEYS: Key[] = [
  { hour: 0, state: { sunX: 0.3, sunY: 0.25, sunZ: -0.5, sunIntensity: 0.25, sunColor: 0x9fb4ff, hemiSky: 0x1f2a55, hemiGround: 0x101018, hemiIntensity: 0.55, skyTop: 0x0b1030, skyBottom: 0x2a3061, fog: 0x1a1f3d, exposure: 0.8, night: 1 } },
  { hour: 6, state: { sunX: 0.9, sunY: 0.2, sunZ: 0.2, sunIntensity: 1.4, sunColor: 0xffc08a, hemiSky: 0xf4c8a8, hemiGround: 0x8a6a4e, hemiIntensity: 0.7, skyTop: 0x7fa4e8, skyBottom: 0xffd2a6, fog: 0xf6d5b8, exposure: 1.0, night: 0.25 } },
  { hour: 12, state: { sunX: 0.35, sunY: 0.9, sunZ: 0.25, sunIntensity: 2.3, sunColor: 0xfff4e0, hemiSky: 0xbfe0ff, hemiGround: 0xc9b89a, hemiIntensity: 0.75, skyTop: 0x4f8fe6, skyBottom: 0xcfe8ff, fog: 0xd8ecff, exposure: 1.05, night: 0 } },
  { hour: 18, state: { sunX: -0.9, sunY: 0.18, sunZ: 0.15, sunIntensity: 1.3, sunColor: 0xff9a5a, hemiSky: 0xf7b48b, hemiGround: 0x6e4a3a, hemiIntensity: 0.65, skyTop: 0x5d6fc9, skyBottom: 0xffa26b, fog: 0xf2b797, exposure: 0.98, night: 0.35 } },
  { hour: 24, state: { sunX: 0.3, sunY: 0.25, sunZ: -0.5, sunIntensity: 0.25, sunColor: 0x9fb4ff, hemiSky: 0x1f2a55, hemiGround: 0x101018, hemiIntensity: 0.55, skyTop: 0x0b1030, skyBottom: 0x2a3061, fog: 0x1a1f3d, exposure: 0.8, night: 1 } },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function lerpHex(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return (Math.round(lerp(ar, br, t)) << 16) | (Math.round(lerp(ag, bg, t)) << 8) | Math.round(lerp(ab, bb, t));
}

export function sunStateAt(hour: number): SunState {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1]!.hour <= h) i++;
  const a = KEYS[i]!;
  const b = KEYS[i + 1]!;
  const t = (h - a.hour) / (b.hour - a.hour);
  const s = a.state;
  const e = b.state;
  return {
    sunX: lerp(s.sunX, e.sunX, t),
    sunY: lerp(s.sunY, e.sunY, t),
    sunZ: lerp(s.sunZ, e.sunZ, t),
    sunIntensity: lerp(s.sunIntensity, e.sunIntensity, t),
    sunColor: lerpHex(s.sunColor, e.sunColor, t),
    hemiSky: lerpHex(s.hemiSky, e.hemiSky, t),
    hemiGround: lerpHex(s.hemiGround, e.hemiGround, t),
    hemiIntensity: lerp(s.hemiIntensity, e.hemiIntensity, t),
    skyTop: lerpHex(s.skyTop, e.skyTop, t),
    skyBottom: lerpHex(s.skyBottom, e.skyBottom, t),
    fog: lerpHex(s.fog, e.fog, t),
    exposure: lerp(s.exposure, e.exposure, t),
    night: lerp(s.night, e.night, t),
  };
}

export function mixSunStates(a: SunState, b: SunState, t: number): SunState {
  return {
    sunX: lerp(a.sunX, b.sunX, t),
    sunY: lerp(a.sunY, b.sunY, t),
    sunZ: lerp(a.sunZ, b.sunZ, t),
    sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t),
    sunColor: lerpHex(a.sunColor, b.sunColor, t),
    hemiSky: lerpHex(a.hemiSky, b.hemiSky, t),
    hemiGround: lerpHex(a.hemiGround, b.hemiGround, t),
    hemiIntensity: lerp(a.hemiIntensity, b.hemiIntensity, t),
    skyTop: lerpHex(a.skyTop, b.skyTop, t),
    skyBottom: lerpHex(a.skyBottom, b.skyBottom, t),
    fog: lerpHex(a.fog, b.fog, t),
    exposure: lerp(a.exposure, b.exposure, t),
    night: lerp(a.night, b.night, t),
  };
}

/** The current hour in Lagos as a fraction, e.g. 14.5 for 14:30. */
export function lagosHour(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return (get("hour") % 24) + get("minute") / 60 + get("second") / 3600;
}
