import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

/**
 * Base ESLint configuration for the monorepo.
 * Apps can extend this and add their own rules.
 */
export default [
  // Global ignores
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**"],
  },

  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript files config
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.es2025,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Prettier must be last
  eslintConfigPrettier,
];
