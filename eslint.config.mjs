import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Supabase query builders return loosely-typed rows; `any` is used
      // deliberately at those boundaries. Fully typing them is high-churn
      // with no runtime benefit, so this is not treated as an error.
      "@typescript-eslint/no-explicit-any": "off",
      // Same reasoning for the nested-relation accesses that use `@ts-ignore`.
      "@typescript-eslint/ban-ts-comment": "off",
      // Apostrophes/quotes in JSX copy render correctly; purely cosmetic.
      "react/no-unescaped-entities": "off",
      // Allow intentionally-unused args/vars when prefixed with `_`.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
    },
  },
]);

export default eslintConfig;
