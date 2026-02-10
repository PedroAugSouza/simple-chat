import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import vercelAISecurity from "eslint-plugin-vercel-ai-security";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  vercelAISecurity.configs.strict,
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
]);

export default eslintConfig;
