import {buildConfig} from '@ver0/eslint-config';

/** @typedef {import('eslint').Linter} Linter */

/** @type {Linter.Config[]} */
const cfg = [
	{
		ignores: ['dist', 'node_modules', '.yarn', 'coverage'],
	},
	...buildConfig({
		globals: 'node',
		vitest: true,
	}),
	{
		files: ['README.md'],
		language: 'markdown/gfm',
	},
	{
		files: ['**/*.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-declaration-merging': 'off',
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
		},
	},
];

export default cfg;
