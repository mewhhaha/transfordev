import { err, ok, route } from "@mewhhaha/little-worker";
import { data_ } from "@mewhhaha/little-router-plugin-data";
import { type } from "arktype";
import { $get } from "../utils/durable-object";
import { publish, translate } from "../utils/actions";

export default route(
  "/languages/:language/paths/:path",
  [data_(type({ value: "string" }))],
  async ({ params, data: { value } }, env, ctx) => {
    const language = decodeURIComponent(params.language);
    const path = decodeURIComponent(params.path);

    const translation = $get(env.TRANSLATION, { name: path });
    const result = await translation.set({
      language,
      value,
      path,
    });

    if (result.message === "unlisted_language") {
      return err(422, result.message);
    } else if (result.message === "old_value") {
      return err(409, result.message);
    }

    const after = async () => {
      const data = {
        from: language,
        date: result.data.date,
        path,
        value,
      };

      await Promise.all([
        publish(env.LIST, data),
        // Only request translations if we update the base language
        data.from === language
          ? translate(env.QUEUE, result.data.to, data)
          : null,
      ]);
    };

    ctx.waitUntil(after());

    return ok(200, result.data);
  },
);
