import {defineConfig} from 'eslint/config';
import javascript from '@ver0/eslint-config/javascript';
import typescript, {typescriptUnsafe} from '@ver0/eslint-config/typescript';
import node from '@ver0/eslint-config/node';
import markdown from '@ver0/eslint-config/markdown';
import vitest from '@ver0/eslint-config/vitest';

export default defineConfig(
	{
		ignores: ['dist', 'node_modules', '.yarn', 'coverage'],
	},
	javascript,
	typescript,
	typescriptUnsafe,
	node,
	markdown,
	vitest,
	{
		files: ['**/*.ts'],
		rules: {
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
		},
	},
);
