import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig(
    { ignores: ["dist/"] },
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
          parserOptions: {
            projectServices: true,
            tsconfigRootDir: import.meta.dirname,
          } ,  

        },
    },
    {
        rules: {
            "@typescript-eslint/no-non-null-assertion": "error",
            eqeqeq: ["error", "always"],
        },
    },
    {
       files: ["**/*.js"],
       extends: [tseslint.configs.disableTypeChecked],
    },
);