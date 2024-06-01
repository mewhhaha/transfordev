import { DurableObject } from "cloudflare:workers";

type SetTranslation = {
  language: string;
  path: string;
  value: string;
  date?: Date;
};

type Translation = {
  language: string;
  value: string;
  date: Date;
};

export class DurableObjectTranslation extends DurableObject<Env> {
  // Base language
  #from: string = "";

  // Target languages
  #to: string[] = [];

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    state.blockConcurrencyWhile(async () => {
      const from = await this.ctx.storage.get<string>(`meta#from`);
      const to = await this.ctx.storage.get<string[]>(`meta#to`);

      if (from) {
        this.#from = from;
      }
      if (to) {
        this.#to = to;
      }
    });
  }

  #languageKey(language: string) {
    return `lang#${btoa(language)}#date#` as const;
  }

  #dateKey(language: string, date: Date) {
    return `lang#${btoa(language)}#date#${date.toISOString()}` as const;
  }

  async #latest(language: string) {
    const latest = await this.ctx.storage.list<Translation | undefined>({
      prefix: this.#languageKey(language),
      limit: 1,
    });
    const [result] = [...latest.values()];
    return result;
  }

  async setup(from: string, to: string[], translation: SetTranslation) {
    this.#from = from;
    this.ctx.storage.put<string>("meta#from", from);

    this.#to = to;
    this.ctx.storage.put<string[]>("meta#to", to);

    return await this.set(translation);
  }

  async set({ language, date, path, value }: SetTranslation) {
    if (this.#from !== language && !this.#to.includes(language)) {
      return { error: true, message: "unlisted_language" } as const;
    }

    if (date) {
      const latest = await this.#latest(language);
      if (latest && date < latest.date) {
        return { error: true, message: "old_value" } as const;
      }
    } else {
      date = new Date();
    }

    const dateKey = this.#dateKey(language, date);

    this.ctx.storage.put<Translation>(dateKey, { value, date, language });

    return {
      error: false,
      data: { language, from: this.#from, to: this.#to, value, date, path },
    } as const;
  }

  async translations() {
    const translations: Translation[] = [];
    for (const language of [this.#from, ...this.#to]) {
      let latest = await this.#latest(language);
      latest ??= { language, value: "", date: new Date() };
      translations.push(latest);
    }
    return translations;
  }

  async recent(language: string, { limit }: { limit: number }) {
    const list = await this.ctx.storage.list<Translation>({
      prefix: this.#languageKey(language),
      limit,
    });
    return [...list.values()];
  }
}
