import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

export const loader = async (_: LoaderFunctionArgs) => {
  throw redirect("/translations");
};
