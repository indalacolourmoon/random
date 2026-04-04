import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".agent/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "tmp/**",
      "scripts/**",
      "**/*.js",
      "**/*.mjs",
      "!eslint.config.mjs",
      "!next.config.mjs",
      "!postcss.config.mjs"
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ]
    }
  }
];

export default eslintConfig;
