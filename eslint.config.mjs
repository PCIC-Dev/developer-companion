// Single ESLint flat config shared by every workspace (web, api, shared).
// One identical, strict config keeps the two apps from drifting.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
    },
    rules: {
      // Allow intentionally-unused args/vars when prefixed with underscore
      // (e.g. Express's 4-arg error-handler signature).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["apps/api/**/*.ts", "packages/shared/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Keep formatting concerns entirely in Prettier. Must stay last.
  prettier,
);
