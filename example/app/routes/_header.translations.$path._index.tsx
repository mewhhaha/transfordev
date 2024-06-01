import { fetcher } from "@mewhhaha/little-fetcher";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { defer } from "@remix-run/cloudflare";
import { Await, Form, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect, useRef, useState } from "react";
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
  const [edit, setEdit] = useState<Omit<EditProps, "onClose"> | null>(null);
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
                  <li key={language}>
                    <button
                      onClick={() => {
                        setEdit({ value, language, date: new Date(date) });
                      }}
                      className="flex items-center"
                    >
                      <h3 className="w-12 flex-none text-left text-sm">
                        {language}
                      </h3>
                      <p className="font-medium">{value || "---"}</p>
                    </button>
                  </li>
                );
              });
            }}
          </Await>
        </Suspense>
      </ol>
      {edit && <Edit {...edit} onClose={() => setEdit(null)} />}
    </main>
  );
}

type EditProps = {
  date: Date;
  value: string;
  language: string;
  onClose: () => void;
};

const Edit = ({ date, value, language, onClose }: EditProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog onClose={onClose} ref={ref} key={language}>
      <Form method="POST">
        <p className="text-xl">{language}</p>
        <textarea className="h-32 w-full" defaultValue={value}>
          {value}
        </textarea>
        <dl className="flex flex-col gap-1">
          <div>
            <dt className="text-sm font-medium">Updated at</dt>
            <dd>
              <time dateTime={date.toISOString()}>
                {new Date(date).toLocaleDateString("en-us")}
              </time>
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex w-full justify-end">
          <button className="rounded border-2 px-2 py-1" onClick={onClose}>
            Close
          </button>
          <button className="rounded border-2 bg-black px-2 py-1 text-white">
            Save
          </button>
        </div>
      </Form>
    </dialog>
  );
};
