import { ok, route } from "@mewhhaha/little-worker";
import { CacheMetadata, cacheKey } from "../utils/actions";
import { type } from "arktype";
import { query_ } from "@mewhhaha/little-router-plugin-query";

export default route(
  "/languages/:language/prefixes/:prefix",
  [query_(type({ "limit?": "number", "cursor?": "string" }))],
  async ({ params, query: { limit = 100, cursor } }, env) => {
    const language = decodeURIComponent(params.language);
    const prefix = decodeURIComponent(params.prefix);

    const key = cacheKey(language, prefix);
    const list = await env.CACHE.list({ prefix: key, limit, cursor });

    return ok(200, {
      translations: list.keys.map((key) => key.metadata as CacheMetadata),
      cursor: list.list_complete ? undefined : list.cursor,
    });
  },
);
