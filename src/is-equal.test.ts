import {describe, expect, it} from 'vitest';
import type {TestSuite} from './fixtures/tests.js';
import {testCases} from './fixtures/tests.js';
import {isEqual} from './is-equal.js';

function runSuite(suites: TestSuite[], equalFn: (a: any, b: any) => boolean) {
	// eslint-disable-next-line vitest/valid-title
	describe(equalFn.name, () => {
		for (const suite of suites) {
			// eslint-disable-next-line vitest/valid-title
			describe(suite.name, () => {
				for (const test of suite.tests) {
					// eslint-disable-next-line vitest/valid-title
					it(test.name, () => {
						expect(equalFn(test.value1, test.value2)).toBe(test.equal);
					});

					it(`${test.name} (reverse args)`, () => {
						expect(equalFn(test.value2, test.value1)).toBe(test.equal);
					});
				}
			});
		}
	});
}

runSuite(testCases, isEqual);

it('should not throw on nested react elements with circular references #264', () => {
	const children1: Record<any, any> = {
		a: 1, bax: 'qux', foo: 'bar', $$typeof: 'component',
	};
	children1.__v = children1;
	const children2: Record<any, any> = {
		a: 1, bax: 'qux', foo: 'bar', $$typeof: 'component',
	};
	children2.__v = children2;

	const propsPrevious = {children: children1};
	const propsNext = {children: children2};

	expect(() => {
		isEqual(propsPrevious, propsNext);
	}).not.toThrow();
});

it('should properly handle null-prototype objects', () => {
	const a = Object.create(null);
	const b = Object.create(null);
	const c: any = {};

	a.foo = 'bar';
	b.foo = 'bar';
	c.foo = 'bar';

	expect(isEqual(a, b)).toBe(true);
	expect(isEqual(a, c)).toBe(false); // c has a prototype

	b.baz = 'qux';

	expect(isEqual(a, b)).toBe(false);
});

it('should properly handle NaN', () => {
	expect(isEqual(Number.NaN, Number.NaN)).toBe(true);
	expect(isEqual(Number.NaN, 0)).toBe(false);
	expect(isEqual(0, Number.NaN)).toBe(false);
});
