import { WORLD_API_KEY } from "~/utils/world/apiKey";

/** The running world's command API (a shallow ref; null before boot). */
export default function useWorldApi() {
  return inject(WORLD_API_KEY, shallowRef(null));
}
