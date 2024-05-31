import { Router, type RouteData } from "@mewhhaha/little-worker";
import route_Z2V0Lmxhbmd1YWdlcy4kbGFuZ3VhZ2UucGF0aHMuJHBhdGgucmVjZW50LnRz from "./get.languages.$language.paths.$path.recent.js";
import route_cHV0Lmxhbmd1YWdlcy4kbGFuZ3VhZ2UucGF0aHMuJHBhdGgudHM from "./put.languages.$language.paths.$path.js";
import route_Z2V0Lmxhbmd1YWdlcy4kbGFuZ3VhZ2UucHJlZml4ZXMuJHByZWZpeC50cw from "./get.languages.$language.prefixes.$prefix.js";
import route_cG9zdC5wYXRocy4kcGF0aC50cw from "./post.paths.$path.js";
import route_Z2V0LnRyYW5zbGF0aW9ucy4kcGF0aC50cw from "./get.translations.$path.js";
export const router = Router<
  RouteData["extra"] extends unknown[] ? RouteData["extra"] : []
>()
  .get(...route_Z2V0Lmxhbmd1YWdlcy4kbGFuZ3VhZ2UucGF0aHMuJHBhdGgucmVjZW50LnRz)
  .put(...route_cHV0Lmxhbmd1YWdlcy4kbGFuZ3VhZ2UucGF0aHMuJHBhdGgudHM)
  .get(...route_Z2V0Lmxhbmd1YWdlcy4kbGFuZ3VhZ2UucHJlZml4ZXMuJHByZWZpeC50cw)
  .post(...route_cG9zdC5wYXRocy4kcGF0aC50cw)
  .get(...route_Z2V0LnRyYW5zbGF0aW9ucy4kcGF0aC50cw);
const routes = router.infer;
export type Routes = typeof routes;

declare module "@mewhhaha/little-worker" {
  interface RouteData {
    paths:
      | "/languages/:language/paths/:path/recent"
      | "/languages/:language/paths/:path"
      | "/languages/:language/prefixes/:prefix"
      | "/paths/:path"
      | "/translations/:path";
  }
}
