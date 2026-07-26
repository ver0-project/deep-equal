import type {OxlintConfig} from 'oxlint';
import {defineConfig} from 'vite-plus';
import {coverageConfigDefaults} from 'vitest/config';
import javascript from '@ver0/oxlint-config/javascript.js';
import typescript, {typescriptUnsafe} from '@ver0/oxlint-config/typescript.js';
import node from '@ver0/oxlint-config/node.js';
import vitest from '@ver0/oxlint-config/vitest.js';

// Composed via extends after the presets so these overrides apply last.
const repoOverrides: OxlintConfig = {
	rules: {
		// The comparator compares arbitrary values, including the mutable
		// containers it is most often used on -- readonly parameters would
		// misdescribe the public API and every fixture built for it.
		'typescript/prefer-readonly-parameter-types': 'off',
	},
	overrides: [
		{
			files: ['**/*.test.ts'],
			rules: {
				// __v is Preact's vnode back-reference, reproduced verbatim by
				// the circular-reference regression test.
				'no-underscore-dangle': ['error', {allow: ['__v']}],
			},
		},
	],
};

export default defineConfig({
	test: {
		dir: './src',
		coverage: {
			exclude: ['src/fixtures/**', ...coverageConfigDefaults.exclude],
		},
	},
	lint: {
		options: {typeCheck: true},
		extends: [javascript, typescript, typescriptUnsafe, node, vitest, repoOverrides],
		ignorePatterns: ['.claude', '.idea', 'dist', 'coverage', 'CHANGELOG.md'],
	},
	fmt: {
		useTabs: true,
		tabWidth: 2,
		printWidth: 120,
		endOfLine: 'lf',
		trailingComma: 'all',
		semi: true,
		singleQuote: true,
		bracketSameLine: true,
		bracketSpacing: false,
		arrowParens: 'always',
		proseWrap: 'always',
		ignorePatterns: ['.claude', '.idea', 'dist', 'coverage', 'CHANGELOG.md'],
	},
});
