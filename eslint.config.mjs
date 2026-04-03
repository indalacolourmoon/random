import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
];

export default eslintConfig;
