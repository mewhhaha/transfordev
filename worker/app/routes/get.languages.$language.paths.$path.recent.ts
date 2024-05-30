import { ok, route } from "@mewhhaha/little-worker";
import { $get } from "../utils/durable-object";

export default route(
  "/languages/:language/paths/:path/recent",
  [],
  async ({ params }, env) => {
    const language = decodeURIComponent(params.language);
    const path = decodeURIComponent(params.path);

    const translation = $get(env.TRANSLATION, { name: path });
    const result = await translation.recent(language, { limit: 10 });

    return ok(200, result);
  },
);
