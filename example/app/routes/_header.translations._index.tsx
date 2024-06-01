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
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { type ListMetadata, type Routes } from "transfordev";
import { ArkErrors, type } from "arktype";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const worker = fetcher<Routes>(context.cloudflare.env.WORKER);

  const language = encodeURIComponent("en-us");
  const prefix = encodeURIComponent("test.");
  const response = await worker.get(
    `/languages/${language}/prefixes/${prefix}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load translations");
  }

  return defer({ deferred: response.json() });
};

const parseForm = type({ key: /^[a-z0-9]+(\.[a-z0-9]+)*$/, value: "string" });

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const languages = ["se-se", "de-de", "fr-fr", "es-es", "it-it", "pl-pl"];

  const formData = await request.formData();
  const result = parseForm(Object.fromEntries(formData.entries()));
  if (result instanceof ArkErrors) {
    console.log(...result.values());
    return { error: true, message: "invalid_form_data" } as const;
  }

  const worker = fetcher<Routes>(context.cloudflare.env.WORKER);
  const path = encodeURIComponent(result.key);

  const response = await worker.post(`/paths/${path}`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      value: result.value,
      from: "en-us",
      to: languages,
    }),
  });

  if (!response.ok) {
    return { error: true, message: "failed_add" } as const;
  }

  return { error: false, added: await response.json() } as const;
};

export default function Index() {
  const { deferred } = useLoaderData<typeof loader>();
  const [optimistic, setOptimistic] = useState<ListMetadata[]>([]);

  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.error === false) {
      const { path, value, date, language } = actionData.added;
      let short = value.slice(0, 100);
      if (value.length > 99) {
        short += "...";
      }
      setOptimistic((prev) => [...prev, { path, short, date, language }]);
    }
  }, [actionData]);

  const pushOptimistic = (items: ListMetadata[]) => {
    const copy: (ListMetadata & { submitting?: true })[] = [...items];
    for (const item of optimistic) {
      if (copy.find((i) => i.path === item.path)) {
        setOptimistic((prev) => prev.filter((i) => i.path !== item.path));
      } else {
        const submitting = navigation.state === "submitting";

        copy.push(submitting ? item : { ...item, submitting: true });
      }
    }
    return copy;
  };

  return (
    <main className="p-4">
      <Form method="POST">
        <label htmlFor="key" className="mb-1 block font-semibold">
          Path
        </label>
        <input
          id="key"
          name="key"
          className="rounded border-2 border-gray-900 px-2 py-1"
          aria-describedby="description"
          type="text"
          placeholder="Key"
          pattern="[a-z0-9]+(\.[a-z0-9]+)*"
        />
        <p id="description">
          Should be lower cased letters or numbers delimited by dots
        </p>

        <label htmlFor="value" className="mb-1 mt-4 block font-semibold">
          Translation
        </label>
        <input
          id="value"
          name="value"
          className="rounded border-2 border-gray-900 px-2 py-1"
          type="text"
          placeholder="English translation"
        />
        <button className="my-4 block rounded border-2 border-black px-2 py-1 font-bold">
          Add first translation
        </button>
        {actionData?.error && (
          <p className="text-red-600">
            {match(actionData.message, {
              invalid_form_data: () => {
                return "Invalid form data";
              },
              failed_add: () => {
                return "Failed to add translation";
              },
            })}
          </p>
        )}
      </Form>
      <ul className="px-4">
        <Suspense fallback={<li>Loading...</li>}>
          <Await resolve={deferred}>
            {({ items }) => {
              const copy = pushOptimistic(items);
              return copy.map((item) => {
                return (
                  <li key={item.path} className="flex">
                    <p className="inline">{item.path}</p>
                    <span className="mx-4 inline-block">{"=>"}</span>
                    <Link
                      className="text-blue-600 underline visited:text-purple-600 active:text-blue-700"
                      to={generatePath("/translations/:path", {
                        path: item.path,
                      })}
                    >
                      {item.short}
                    </Link>
                  </li>
                );
              });
            }}
          </Await>
        </Suspense>
      </ul>
    </main>
  );
}

const match = <
  VALUE extends string | number | bigint | boolean | null | undefined,
  MATCHES extends { [KEY in `${VALUE}`]: () => unknown },
>(
  value: VALUE,
  matches: MATCHES,
): ReturnType<MATCHES[`${VALUE}`]> => {
  const func = matches[`${value}`];
  if (!func) {
    throw new Error(`No match for ${value}`);
  }
  return func() as ReturnType<MATCHES[`${VALUE}`]>;
};
