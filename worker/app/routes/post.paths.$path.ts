import { err, ok, route } from "@mewhhaha/little-worker";
import { data_ } from "@mewhhaha/little-router-plugin-data";
import { type } from "arktype";
import { $get } from "../utils/durable-object";
import { publish, translate } from "../utils/actions";

export default route(
  "/paths/:path",
  [data_(type({ value: "string", from: "string", to: "string[]" }))],
  async ({ params, data: { value, from, to } }, env, ctx) => {
    const path = decodeURIComponent(params.path);

    const translation = $get(env.TRANSLATION, { name: path });
    const result = await translation.setup(from, to, {
      language: from,
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
        from,
        date: result.data.date,
        path,
        value,
      };

      await Promise.all([
        publish(env.LIST, data),
        translate(env.QUEUE, to, data),
      ]);
    };

    ctx.waitUntil(after());

    return ok(200, result.data);
  },
);
