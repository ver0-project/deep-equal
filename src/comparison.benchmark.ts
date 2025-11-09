import {dequal} from 'dequal';
// eslint-disable-next-line n/no-missing-import
import fastDeepEqual from 'fast-deep-equal/es6/index.js';
import reactFastCompare from 'react-fast-compare';
import deepEqual from 'deep-equal';
import {bench, describe} from 'vitest';
import * as fixtures from './fixtures/benchmark.js';
import {isEqual} from './is-equal.js';

function runBenchmarks(suites: fixtures.BenchmarkSuite[], functions: Record<string, (a: any, b: any) => boolean>) {
	for (const suite of suites) {
		// eslint-disable-next-line vitest/valid-title
		describe(suite.name, () => {
			for (const [fnName, fn] of Object.entries(functions)) {
				bench(
					// weird error, since the type id valid
					// eslint-disable-next-line vitest/valid-title
					fnName,
					() => {
						fn(...suite.data);
					},
					{time: 1000},
				);
			}
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
