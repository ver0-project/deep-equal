import {describe, expect, it} from 'vite-plus/test';
import type {TestSuite} from './fixtures/tests.js';
import {testCases} from './fixtures/tests.js';
import {isEqual} from './is-equal.js';

function runSuite(suites: TestSuite[], equalFn: (a: any, b: any) => boolean) {
	// oxlint-disable-next-line vitest/valid-title
	describe(equalFn.name, () => {
		for (const suite of suites) {
			// oxlint-disable-next-line vitest/valid-title
			describe(suite.name, () => {
				for (const test of suite.tests) {
					// oxlint-disable-next-line vitest/valid-title
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
		a: 1,
		bax: 'qux',
		foo: 'bar',
		$$typeof: 'component',
	};
	children1.__v = children1;
	const children2: Record<any, any> = {
		a: 1,
		bax: 'qux',
		foo: 'bar',
		$$typeof: 'component',
	};
	children2.__v = children2;

	const propsPrevious = {children: children1};
	const propsNext = {children: children2};

	expect(() => {
		isEqual(propsPrevious, propsNext);
	}).not.toThrow();
});

it('should compare circular objects with different cycle lengths #432', () => {
	const a: Record<any, any> = {n: 1};
	a.next = a;

	const b: Record<any, any> = {n: 1, next: {n: 2}};
	b.next.next = b;

	const c: Record<any, any> = {n: 1, next: {n: 1}};
	c.next.next = c;

	expect(isEqual(a, b)).toBe(false);
	expect(isEqual(b, a)).toBe(false);
	expect(isEqual(a, c)).toBe(true);
	expect(isEqual(c, a)).toBe(true);
});

it('should compare a one-object cycle with three-object cycles #432', () => {
	const a: Record<any, any> = {n: 1};
	a.next = a;

	const ring: Record<any, any> = {n: 1, next: {n: 1, next: {n: 1}}};
	ring.next.next.next = ring;

	const ringWithOtherValue: Record<any, any> = {n: 1, next: {n: 1, next: {n: 2}}};
	ringWithOtherValue.next.next.next = ringWithOtherValue;

	const tailIntoSelfLoop: Record<any, any> = {n: 1, next: {n: 1, next: {n: 1}}};
	tailIntoSelfLoop.next.next.next = tailIntoSelfLoop.next.next;

	expect(isEqual(a, ring)).toBe(true);
	expect(isEqual(ring, a)).toBe(true);
	expect(isEqual(a, ringWithOtherValue)).toBe(false);
	expect(isEqual(ringWithOtherValue, a)).toBe(false);
	expect(isEqual(a, tailIntoSelfLoop)).toBe(true);
	expect(isEqual(tailIntoSelfLoop, a)).toBe(true);
});

function ringOf(length: number, lastValue = 1): Record<any, any> {
	const nodes: Array<Record<any, any>> = Array.from({length}, () => ({n: 1}));
	nodes[length - 1]!.n = lastValue;
	for (let i = 0; i < length; i++) {
		nodes[i]!.next = nodes[(i + 1) % length];
	}

	return nodes[0]!;
}

it.each([[88, 89]])('should compare rings of %i and %i objects #432', (shorter, longer) => {
	expect(isEqual(ringOf(shorter), ringOf(longer))).toBe(true);
	expect(isEqual(ringOf(longer), ringOf(shorter))).toBe(true);
	expect(isEqual(ringOf(shorter), ringOf(longer, 2))).toBe(false);
	expect(isEqual(ringOf(longer, 2), ringOf(shorter))).toBe(false);
});

it('should compare circular arrays with different cycle lengths #432', () => {
	const x: any[] = [];
	x.push(x);

	const y: any[] = [[]];
	y[0].push(y);

	const xWithValue: any[] = [1];
	xWithValue.push(xWithValue);

	const yWithOtherValue: any[] = [1, [2]];
	yWithOtherValue[1].push(yWithOtherValue);

	expect(isEqual(x, y)).toBe(true);
	expect(isEqual(y, x)).toBe(true);
	expect(isEqual(xWithValue, yWithOtherValue)).toBe(false);
	expect(isEqual(yWithOtherValue, xWithValue)).toBe(false);
});

it('should compare circular maps with different cycle lengths #432', () => {
	const m1 = new Map<string, any>();
	m1.set('next', m1).set('n', 1);

	const m2 = new Map<string, any>();
	const m2Next = new Map<string, any>();
	m2.set('next', m2Next).set('n', 1);
	m2Next.set('next', m2).set('n', 2);

	const m3 = new Map<string, any>();
	const m3Next = new Map<string, any>();
	m3.set('next', m3Next).set('n', 1);
	m3Next.set('next', m3).set('n', 1);

	expect(isEqual(m1, m2)).toBe(false);
	expect(isEqual(m2, m1)).toBe(false);
	expect(isEqual(m1, m3)).toBe(true);
	expect(isEqual(m3, m1)).toBe(true);
});

it('should not mutate a Set subclass instance met as one of several partners #432', () => {
	class MySet extends Set {}
	const shared = new MySet();
	const first = new MySet();
	const second = new MySet();

	expect(isEqual([shared, shared], [first, second])).toBe(true);
	expect(first.size).toBe(0);
	expect(second.size).toBe(0);
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

it('should properly handle boxed NaN', () => {
	// oxlint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
	const a = new Number(Number.NaN);
	// oxlint-disable-next-line no-new-wrappers, unicorn/new-for-builtins
	const b = new Number(Number.NaN);

	expect(isEqual(a, b)).toBe(true);
	expect(isEqual(a, a)).toBe(true);
});

it('should require matching valueOf/toString implementations', () => {
	const sharedValueOf = () => 42;
	const a = {valueOf: sharedValueOf};
	const b = {valueOf: sharedValueOf};
	const c = {valueOf: () => 42};

	expect(isEqual(a, b)).toBe(true);
	expect(isEqual(a, c)).toBe(false);
});
