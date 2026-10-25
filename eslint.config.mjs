import {defineConfig, globalIgnores} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // `const {secret: _secret, ...rest} = obj` is how we omit fields; don't flag the omitted ones.
      "@typescript-eslint/no-unused-vars": ["warn", {argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true}],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated data and test output:
    ".data/**",
    "public/data/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
