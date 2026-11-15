import {dequal} from 'dequal';
import fastDeepEqual from 'fast-deep-equal/es6/index.js';
import reactFastCompare from 'react-fast-compare';
import deepEqual from 'deep-equal';
import {test} from 'vite-plus/test';
import * as fixtures from './fixtures/benchmark.js';
import {isEqual} from './is-equal.js';

function runBenchmarks(suites: fixtures.BenchmarkSuite[], functions: Record<string, (a: any, b: any) => boolean>) {
	for (const suite of suites) {
		// oxlint-disable-next-line vitest/valid-title
		test(suite.name, async ({bench}) => {
			await bench.compare(
				...Object.entries(functions).map(([fnName, fn]) =>
					bench(fnName, () => {
						fn(...suite.data);
					}),
				),
				{time: 1000},
			);
		});
	}
}

runBenchmarks(fixtures.simple, {
	deepEqual,
	'@ver0/deep-equal': isEqual,
	'react-fast-compare': reactFastCompare,
	'fast-deep-equal': fastDeepEqual,
	dequal,
});

runBenchmarks(fixtures.complex, {
	deepEqual,
	'@ver0/deep-equal': isEqual,
	'react-fast-compare': reactFastCompare,
	'fast-deep-equal': fastDeepEqual,
	dequal,
});
