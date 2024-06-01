import { ok, route } from "@mewhhaha/little-worker";
import { $get } from "../utils/durable-object";

export default route("/translations/:path", [], async ({ params }, env) => {
  const path = decodeURIComponent(params.path);

  const translation = $get(env.TRANSLATION, { name: path });
  const result = await translation.translations();

  return ok(200, { translations: result });
});
