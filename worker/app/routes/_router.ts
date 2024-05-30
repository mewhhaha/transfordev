import { Router, type RouteData } from "@mewhhaha/little-worker";
import route_0 from "./post.paths.$path.js";
import route_1 from "./get.languages.$language.prefixes.$prefix.js";
import route_2 from "./put.languages.$language.paths.$path.js";
import route_3 from "./get.languages.$language.paths.$path.recent.js";
export const router = Router<
  RouteData["extra"] extends unknown[] ? RouteData["extra"] : []
>()
  .post(route_0[0], route_0[1], route_0[2])
  .get(route_1[0], route_1[1], route_1[2])
  .put(route_2[0], route_2[1], route_2[2])
  .get(route_3[0], route_3[1], route_3[2]);
const routes = router.infer;
export type Routes = typeof routes;

declare module "@mewhhaha/little-worker" {
  interface RouteData {
    paths:
      | "/paths/:path"
      | "/languages/:language/prefixes/:prefix"
      | "/languages/:language/paths/:path"
      | "/languages/:language/paths/:path/recent";
  }
}
