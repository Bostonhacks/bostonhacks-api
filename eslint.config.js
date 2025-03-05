import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  {
    ignores: ["__tests__/"]
  },
  {
    rules: {
      // Keep no-unused-vars as error but with more specific exceptions
      "no-unused-vars": ["error", { 
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_" // Ignore variables starting with underscore
      }]
    }
  }

];