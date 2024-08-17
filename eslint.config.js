import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
	{ files: ["**/*.{js,mjs,cjs,ts}"] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			"linebreak-style": "off",
			"import/no-extraneous-dependencies": "off",
			"no-console": "off",
			indent: "off",
			"import/no-unresolved": "off",
			"consistent-return": "off",
			"max-len": "off",
			"function-paren-newline": "off",
			"implicit-arrow-linebreak": "off",
			"no-trailing-spaces": "off",
			"no-shadow": "off",
		},
	},
];
