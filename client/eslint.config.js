import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default defineConfig(
    { ignores: ["dist/"] },
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            "@typescript-eslint/no-non-null-assertion": "error",
            eqeqeq: ["error", "always"],
        },
    },
    {
        files:["**/*.js"],
        extends: [tseslint.configs.disableTypeChecked],
    },
);