type Translation = {
  from: string;
  path: string;
  value: string;
  date: Date;
};

export const translate = async (
  queue: Queue<AutoTranslationEvent>,
  to: string[],
  {
    from,
    path,
    date,
    value,
  }: {
    from: string;
    path: string;
    value: string;
    date: Date;
  },
) => {
  for (const language of to) {
    void queue.send({
      from,
      to: language,
      path,
      date,
      value,
    });
  }
};

export const publish = async (
  kv: KVNamespace,
  { from, path, value, date }: Translation,
) => {
  const key = cacheKey(from, path);
  let short = value.slice(0, 100);
  if (value.length > 99) {
    short += "...";
  }

  await kv.put(key, value, {
    metadata: { path, date: date.toISOString(), short } satisfies CacheMetadata,
  });
};

export type CacheMetadata = {
  short: string;
  path: string;
  date: string;
};

export const cacheKey = (language: string, path: string) => {
  return `lang#${encodeURIComponent(language)}#path#${encodeURIComponent(path)}` as const;
};
