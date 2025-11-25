import baseConfig from "../../eslint.config.js";
import globals from "globals";

export default [
  // Extend base config
  ...baseConfig,

  // API-specific config
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        Bun: "readonly",
      },
    },
  },
];
