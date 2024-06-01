import { fetcher } from "@mewhhaha/little-fetcher";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { defer } from "@remix-run/cloudflare";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import type { Routes } from "transfordev";

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const worker = fetcher<Routes>(context.cloudflare.env.WORKER);

  const path = encodeURIComponent(params.path as string);
  const response = await worker.get(`/translations/${path}`);

  if (!response.ok) {
    throw new Error("Failed to load translations");
  }

  return defer({ path, deferred: response.json() });
};

export const action = async ({ params, context }: ActionFunctionArgs) => {
  return null;
};

export default function Route() {
  const { path, deferred } = useLoaderData<typeof loader>();

  return (
    <main className="p-4">
      <h2 className="font-mono text-xl">{path}</h2>
      <ol className="space-y-1">
        <Suspense fallback="Loading...">
          <Await resolve={deferred}>
            {({ translations }) => {
              const sorted = [
                translations[0],
                ...translations.slice(1).sort((a, b) => {
                  return a.language < b.language ? -1 : 1;
                }),
              ];

              return sorted.map(({ language, value, date }) => {
                return (
                  <li key={language} className="flex items-center">
                    <h3 className="w-12 flex-none text-left text-sm">
                      {language}
                    </h3>
                    <p className="font-medium">{value || "---"}</p>
                  </li>
                );
              });
            }}
          </Await>
        </Suspense>
      </ol>
    </main>
  );
}
