import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import worker from "@mewhhaha/little-worker/eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  worker.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
