import type { InjectionKey, ShallowRef } from "vue";
import type { WorldApi } from "~/utils/types/world";

/** The HUD and shop reach the running world through this provide/inject key. */
export const WORLD_API_KEY: InjectionKey<ShallowRef<WorldApi | null>> = Symbol("world-api");
