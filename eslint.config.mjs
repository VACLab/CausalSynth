import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";

// Import Prettier configurations
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [{
        languageOptions: {
            globals: globals.browser,
        },
    },
    pluginJs.configs.recommended,
    ...fixupConfigRules(pluginReactConfig),
    prettierConfig, // Disable ESLint rules that conflict with Prettier
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            "prettier/prettier": "error", // Add Prettier as an ESLint rule
        },
    },
    {
        rules: {
            semi: ["error", "always"],
            quotes: ["error", "single"],
        },
        parserOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
];