import { fetcher } from "@mewhhaha/little-fetcher";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Routes } from "transfordev";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loader = async ({
  params: { path },
  context,
}: LoaderFunctionArgs) => {
  const worker = fetcher<Routes>(context.cloudflare.env.WORKER);

  const language = encodeURIComponent("en-us");
  const prefix = encodeURIComponent("test");
  const response = await worker.get("");

  if (!response.ok) {
    throw new Error("Failed to load translations");
  }

  return defer({ deferred: response.json() });
};

export default function Route() {
  return (
    <>
      <header className="flex w-full h-24 border-b-2 border-gray-900">
        <h1>Translations</h1>
      </header>
      <main></main>
    </>
  );
}
