import { fetcher } from "@mewhhaha/little-fetcher";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Await,
  Form,
  Link,
  defer,
  generatePath,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { Routes } from "transfordev";
import { type } from "arktype";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const worker = fetcher<Routes>(context.cloudflare.env.WORKER);

  const language = encodeURIComponent("en-us");
  const prefix = encodeURIComponent("test");
  const response = await worker.get(
    `/languages/${language}/prefixes/${prefix}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load translations");
  }

  return defer({ deferred: response.json() });
};

const parseForm = type({ key: "/^[a-z]+(\\.[a-z])*$/", value: "string" });

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const languages = ["se-se", "de-de", "fr-fr", "es-es", "it-it", "pl-pl"];

  const formData = await request.formData();
  const result = parseForm(Object.fromEntries(formData.entries()));
  if (result.problems) {
    throw new Error("Invalid form data");
  }

  const worker = fetcher<Routes>(context.cloudflare.env.WORKER);
  const path = encodeURIComponent(result.data.key);

  const response = await worker.post(`/paths/${path}`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      value: result.data.value,
      from: "en-us",
      to: languages,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add translation");
  }

  return await response.json();
};

export default function Index() {
  const { deferred } = useLoaderData<typeof loader>();
  return (
    <>
      <header className="flex w-full h-24 border-b-2 border-gray-900">
        <h1>Translations</h1>
      </header>
      <main>
        <Form method="POST">
          <label htmlFor="key">Key</label>
          <input
            id="key"
            name="key"
            className="px-4 py-2 border-2 border-gray-900 rounded"
            aria-describedby="description"
            type="text"
            placeholder="Key"
            pattern="[a-z]+(\\.[a-z]+)*"
          />
          <p id="description">
            Should be lower cased letters delimited by dots
          </p>

          <label htmlFor="value">Value</label>
          <input
            id="value"
            name="value"
            className="px-4 py-2 border-2 border-gray-900 rounded"
            type="text"
            placeholder="Key"
            pattern="[a-z]+(\\.[a-z]+)*"
          />
          <button className="px-4 py-2 rounded">Add key</button>
        </Form>
        <ul>
          <Suspense fallback={<li>Loading...</li>}>
            <Await resolve={deferred}>
              {({ translations }) => {
                return translations.map((translation) => {
                  return (
                    <li key={translation.path}>
                      <Link
                        to={generatePath("/en-us/:path", {
                          path: translation.path,
                        })}
                      >
                        {translation.short}
                      </Link>
                    </li>
                  );
                });
              }}
            </Await>
          </Suspense>
        </ul>
      </main>
    </>
  );
}
