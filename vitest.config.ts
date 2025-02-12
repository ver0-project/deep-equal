import {coverageConfigDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		dir: './src',
		coverage: {
			exclude: ['src/fixtures/**', ...coverageConfigDefaults.exclude],
		},
	},
});
