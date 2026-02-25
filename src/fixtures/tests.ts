/* eslint-disable @typescript-eslint/no-empty-function */
export type TestCase = {
	name: string;
	value1: any;
	value2: any;
	equal: boolean;
	skip?: boolean;
};

export type TestSuite = {
	name: string;
	tests: TestCase[];
};

function func1() {}

function func2() {}

class MyMap extends Map {}

class MySet extends Set {}

const emptyObject = {};

function map(object: Record<any, any>, Class?: any) {
	const a = new (Class ?? Map)();
	// eslint-disable-next-line guard-for-in
	for (const key in object) {
		a.set(key, object[key]);
	}

	return a;
}

function myMap(object: Record<any, any>) {
	return map(object, MyMap);
}

function set(array: any[], Class?: any) {
	const a = new (Class ?? Set)();
	for (const value of array) {
		a.add(value);
	}

	return a;
}

function mySet(array: any[]) {
	return set(array, MySet);
}

export const testCases: TestSuite[] = [
	{
		name: 'scalars',
		tests: [
			{
				name: 'equal numbers',
				value1: 1,
				value2: 1,
				equal: true,
			},
			{
				name: 'not equal numbers',
				value1: 1,
				value2: 2,
				equal: false,
			},
			{
				name: 'number and array are not equal',
				value1: 1,
				value2: [],
				equal: false,
			},
			{
				name: '0 and null are not equal',
				value1: 0,
				value2: null,
				equal: false,
			},
			{
				name: 'equal strings',
				value1: 'a',
				value2: 'a',
				equal: true,
			},
			{
				name: 'not equal strings',
				value1: 'a',
				value2: 'b',
				equal: false,
			},
			{
				name: 'empty string and null are not equal',
				value1: '',
				value2: null,
				equal: false,
			},
			{
				name: 'null is equal to null',
				value1: null,
				value2: null,
				equal: true,
			},
			{
				name: 'equal booleans (true)',
				value1: true,
				value2: true,
				equal: true,
			},
			{
				name: 'equal booleans (false)',
				value1: false,
				value2: false,
				equal: true,
			},
			{
				name: 'not equal booleans',
				value1: true,
				value2: false,
				equal: false,
			},
			{
				name: '1 and true are not equal',
				value1: 1,
				value2: true,
				equal: false,
			},
			{
				name: '0 and false are not equal',
				value1: 0,
				value2: false,
				equal: false,
			},
			{
				name: 'NaN and NaN are equal',
				value1: Number.NaN,
				value2: Number.NaN,
				equal: true,
			},
			{
				name: '0 and -0 are equal',
				value1: 0,
				value2: -0,
				equal: true,
			},
			{
				name: 'Infinity and Infinity are equal',
				value1: Number.POSITIVE_INFINITY,
				value2: Number.POSITIVE_INFINITY,
				equal: true,
			},
			{
				name: 'Infinity and -Infinity are not equal',
				value1: Number.POSITIVE_INFINITY,
				value2: Number.NEGATIVE_INFINITY,
				equal: false,
			},
		],
	},

	{
		name: 'objects',
		tests: [
			{
				name: 'empty objects are equal',
				value1: {},
				value2: {},
				equal: true,
			},
			{
				name: 'equal objects (same properties "order")',
				value1: {a: 1, b: '2'},
				value2: {a: 1, b: '2'},
				equal: true,
			},
			{
				name: 'equal objects (different properties "order")',
				value1: {a: 1, b: '2'},
				value2: {b: '2', a: 1},
				equal: true,
			},
			{
				name: 'not equal objects (extra property)',
				value1: {a: 1, b: '2'},
				value2: {a: 1, b: '2', c: []},
				equal: false,
			},
			{
				name: 'not equal objects (different property values)',
				value1: {a: 1, b: '2', c: 3},
				value2: {a: 1, b: '2', c: 4},
				equal: false,
			},
			{
				name: 'not equal objects (different properties)',
				value1: {a: 1, b: '2', c: 3},
				value2: {a: 1, b: '2', d: 3},
				equal: false,
			},
			{
				name: 'equal objects (same sub-properties)',
				value1: {a: [{b: 'c'}]},
				value2: {a: [{b: 'c'}]},
				equal: true,
			},
			{
				name: 'not equal objects (different sub-property value)',
				value1: {a: [{b: 'c'}]},
				value2: {a: [{b: 'd'}]},
				equal: false,
			},
			{
				name: 'not equal objects (different sub-property)',
				value1: {a: [{b: 'c'}]},
				value2: {a: [{c: 'c'}]},
				equal: false,
			},
			{
				name: 'empty array and empty object are not equal',
				value1: {},
				value2: [],
				equal: false,
			},
			{
				name: 'object with extra undefined properties are not equal #1',
				value1: {},
				value2: {foo: undefined},
				equal: false,
			},
			{
				name: 'object with extra undefined properties are not equal #2',
				value1: {foo: undefined},
				value2: {},
				equal: false,
			},
			{
				name: 'object with extra undefined properties are not equal #3',
				value1: {foo: undefined},
				value2: {bar: undefined},
				equal: false,
			},
			{
				name: 'nulls are equal',
				value1: null,
				value2: null,
				equal: true,
			},
			{
				name: 'null and undefined are not equal',
				value1: null,
				value2: undefined,
				equal: false,
			},
			{
				name: 'null and empty object are not equal',
				value1: null,
				value2: {},
				equal: false,
			},
			{
				name: 'undefined and empty object are not equal',
				value1: undefined,
				value2: {},
				equal: false,
			},
			{
				name: 'objects with different `valueOf` functions returning same values are equal',
				value1: {valueOf: () => 'Hello world!'},
				value2: {valueOf: () => 'Hello world!'},
				equal: true,
			},
			{
				name: 'objects with `valueOf` functions returning different values are not equal',
				value1: {valueOf: () => 'Hello world!'},
				value2: {valueOf: () => 'Hi!'},
				equal: false,
			},
			{
				name: 'objects with different `toString` functions returning same values are equal',
				value1: {toString: () => 'Hello world!'},
				value2: {toString: () => 'Hello world!'},
				equal: true,
			},
			{
				name: 'objects with `toString` functions returning different values are not equal',
				value1: {toString: () => 'Hello world!'},
				value2: {toString: () => 'Hi!'},
				equal: false,
			},
		],
	},

	{
		name: 'arrays',
		tests: [
			{
				name: 'two empty arrays are equal',
				value1: [],
				value2: [],
				equal: true,
			},
			{
				name: 'equal arrays',
				value1: [1, 2, 3],
				value2: [1, 2, 3],
				equal: true,
			},
			{
				name: 'not equal arrays (different item)',
				value1: [1, 2, 3],
				value2: [1, 2, 4],
				equal: false,
			},
			{
				name: 'not equal arrays (different length)',
				value1: [1, 2, 3],
				value2: [1, 2],
				equal: false,
			},
			{
				name: 'equal arrays of objects',
				value1: [{a: 'a'}, {b: 'b'}],
				value2: [{a: 'a'}, {b: 'b'}],
				equal: true,
			},
			{
				name: 'not equal arrays of objects',
				value1: [{a: 'a'}, {b: 'b'}],
				value2: [{a: 'a'}, {b: 'c'}],
				equal: false,
			},
			{
				name: 'pseudo array and equivalent array are not equal',
				value1: {0: 0, 1: 1, length: 2},
				value2: [0, 1],
				equal: false,
			},
		],
	},
	{
		name: 'Date objects',
		tests: [
			{
				name: 'equal date objects',
				value1: new Date('2017-06-16T21:36:48.362Z'),
				value2: new Date('2017-06-16T21:36:48.362Z'),
				equal: true,
			},
			{
				name: 'not equal date objects',
				value1: new Date('2017-06-16T21:36:48.362Z'),
				value2: new Date('2017-01-01T00:00:00.000Z'),
				equal: false,
			},
			{
				name: 'date and string are not equal',
				value1: new Date('2017-06-16T21:36:48.362Z'),
				value2: '2017-06-16T21:36:48.362Z',
				equal: false,
			},
			{
				name: 'date and object are not equal',
				value1: new Date('2017-06-16T21:36:48.362Z'),
				value2: {},
				equal: false,
			},
		],
	},
	{
		name: 'RegExp objects',
		tests: [
			{
				name: 'equal RegExp objects',
				value1: /foo/v,
				value2: /foo/v,
				equal: true,
			},
			{
				name: 'not equal RegExp objects (different pattern)',
				value1: /foo/v,
				value2: /bar/v,
				equal: false,
			},
			{
				name: 'not equal RegExp objects (different flags)',
				value1: /foo/v,
				value2: /foo/iv,
				equal: false,
			},
			{
				name: 'RegExp and string are not equal',
				value1: /foo/v,
				value2: 'foo',
				equal: false,
			},
			{
				name: 'RegExp and object are not equal',
				value1: /foo/v,
				value2: {},
				equal: false,
			},
		],
	},
	{
		name: 'functions',
		tests: [
			{
				name: 'same function is equal',
				value1: func1,
				value2: func1,
				equal: true,
			},
			{
				name: 'different functions are not equal',
				value1: func1,
				value2: func2,
				equal: false,
			},
		],
	},
	{
		name: 'mixed objects',
		tests: [
			{
				name: 'big object',
				value1: {
					prop1: 'value1',
					prop2: 'value2',
					prop3: 'value3',
					prop4: {
						subProp1: 'sub value1',
						subProp2: {
							subSubProp1: 'sub sub value1',
							subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5],
						},
					},
					prop5: 1000,
					prop6: new Date(2016, 2, 10),
				},
				value2: {
					prop5: 1000,
					prop3: 'value3',
					prop1: 'value1',
					prop2: 'value2',
					prop6: new Date('2016/03/10'),
					prop4: {
						subProp2: {
							subSubProp1: 'sub sub value1',
							subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5],
						},
						subProp1: 'sub value1',
					},
				},
				equal: true,
			},
		],
	},
	{
		name: 'bigint',
		tests: [
			{
				name: 'equal bigints',
				value1: 1n,
				value2: 1n,
				equal: true,
			},
			{
				name: 'not equal bigints',
				value1: 1n,
				value2: 2n,
				equal: false,
			},
		],
	},

	{
		name: 'Maps',
		tests: [
			{
				name: 'empty maps are equal',
				value1: new Map(),
				value2: new Map(),
				equal: true,
			},
			{
				name: 'empty maps of different class are not equal',
				value1: new Map(),
				value2: new MyMap(),
				equal: false,
			},
			{
				name: 'equal maps (same key "order")',
				value1: map({a: 1, b: '2'}),
				value2: map({a: 1, b: '2'}),
				equal: true,
			},
			{
				name: 'not equal maps (same key "order" - instances of different classes)',
				value1: map({a: 1, b: '2'}),
				value2: myMap({a: 1, b: '2'}),
				equal: false,
			},
			{
				name: 'equal maps (different key "order")',
				value1: map({a: 1, b: '2'}),
				value2: map({b: '2', a: 1}),
				equal: true,
			},
			{
				name: 'equal maps (different key "order" - instances of the same subclass)',
				value1: myMap({a: 1, b: '2'}),
				value2: myMap({b: '2', a: 1}),
				equal: true,
			},
			{
				name: 'not equal maps (extra key)',
				value1: map({a: 1, b: '2'}),
				value2: map({a: 1, b: '2', c: []}),
				equal: false,
			},
			{
				name: 'not equal maps (different key value)',
				value1: map({a: 1, b: '2', c: 3}),
				value2: map({a: 1, b: '2', c: 4}),
				equal: false,
			},
			{
				name: 'not equal maps (different keys)',
				value1: map({a: 1, b: '2', c: 3}),
				value2: map({a: 1, b: '2', d: 3}),
				equal: false,
			},
			{
				name: 'equal maps (same sub-keys)',
				value1: map({a: [map({b: 'c'})]}),
				value2: map({a: [map({b: 'c'})]}),
				equal: true,
			},
			{
				name: 'not equal maps (different sub-key value)',
				value1: map({a: [map({b: 'c'})]}),
				value2: map({a: [map({b: 'd'})]}),
				equal: false,
			},
			{
				name: 'not equal maps (different sub-key)',
				value1: map({a: [map({b: 'c'})]}),
				value2: map({a: [map({c: 'c'})]}),
				equal: false,
			},
			{
				name: 'empty map and empty object are not equal',
				value1: {},
				value2: new Map(),
				equal: false,
			},
			{
				name: 'map with extra undefined key is not equal #1',
				value1: map({}),
				value2: map({foo: undefined}),
				equal: false,
			},
			{
				name: 'map with extra undefined key is not equal #2',
				value1: map({foo: undefined}),
				value2: map({}),
				equal: false,
			},
			{
				name: 'maps with extra undefined keys are not equal #3',
				value1: map({foo: undefined}),
				value2: map({bar: undefined}),
				equal: false,
			},
			{
				name: 'null and empty map are not equal',
				value1: null,
				value2: new Map(),
				equal: false,
			},
			{
				name: 'undefined and empty map are not equal',
				value1: undefined,
				value2: new Map(),
				equal: false,
			},
			{
				name: 'map and a pseudo map are not equal',
				value1: map({}),
				value2: {
					constructor: Map,
					size: 0,
					has: () => true,
					get: () => 1,
				},
				equal: false,
			},
		],
	},

	{
		name: 'Sets',
		tests: [
			{
				name: 'empty sets are equal',
				value1: new Set(),
				value2: new Set(),
				equal: true,
			},
			{
				name: 'empty sets of different class are not equal',
				value1: new Set(),
				value2: new MySet(),
				equal: false,
			},
			{
				name: 'equal sets (same value "order")',
				value1: set(['a', 'b']),
				value2: set(['a', 'b']),
				equal: true,
			},
			{
				name: 'not equal sets (same value "order" - instances of different classes)',
				value1: set(['a', 'b']),
				value2: mySet(['a', 'b']),
				equal: false,
			},
			{
				name: 'equal sets (different value "order")',
				value1: set(['a', 'b']),
				value2: set(['b', 'a']),
				equal: true,
			},
			{
				name: 'equal sets (different value "order" - instances of the same subclass)',
				value1: mySet(['a', 'b']),
				value2: mySet(['b', 'a']),
				equal: true,
			},
			{
				name: 'not equal sets (extra value)',
				value1: set(['a', 'b']),
				value2: set(['a', 'b', 'c']),
				equal: false,
			},
			{
				name: 'not equal sets (different values)',
				value1: set(['a', 'b', 'c']),
				value2: set(['a', 'b', 'd']),
				equal: false,
			},
			{
				name: 'not equal sets (different instances of objects)',
				value1: set(['a', {}]),
				value2: set(['a', {}]),
				equal: false,
			},
			{
				name: 'equal sets (same instances of objects)',
				value1: set(['a', emptyObject]),
				value2: set(['a', emptyObject]),
				equal: true,
			},
			{
				name: 'empty set and empty object are not equal',
				value1: {},
				value2: new Set(),
				equal: false,
			},
			{
				name: 'empty set and empty array are not equal',
				value1: [],
				value2: new Set(),
				equal: false,
			},
			{
				name: 'set with extra undefined value is not equal #1',
				value1: set([]),
				value2: set([undefined]),
				equal: false,
			},
			{
				name: 'set with extra undefined value is not equal #2',
				value1: set([undefined]),
				value2: set([]),
				equal: false,
			},
			{
				name: 'set and pseudo set are not equal',
				value1: new Set(),
				value2: {
					constructor: Set,
					size: 0,
					has: () => true,
				},
				equal: false,
			},
		],
	},

	{
		name: 'Typed arrays',
		tests: [
			{
				name: 'two empty arrays of the same class are equal',
				value1: new Int32Array([]),
				value2: new Int32Array([]),
				equal: true,
			},
			{
				name: 'two empty arrays of the different class are not equal',
				value1: new Int32Array([]),
				value2: new Int16Array([]),
				equal: false,
			},
			{
				name: 'equal arrays',
				value1: new Int32Array([1, 2, 3]),
				value2: new Int32Array([1, 2, 3]),
				equal: true,
			},
			{
				name: 'equal BigUint64Array arrays',
				value1: new BigUint64Array([1n, 2n, 3n]),
				value2: new BigUint64Array([1n, 2n, 3n]),
				equal: true,
			},
			{
				name: 'not equal BigUint64Array arrays',
				value1: new BigUint64Array([1n, 2n, 3n]),
				value2: new BigUint64Array([1n, 2n, 4n]),
				equal: false,
			},
			{
				name: 'not equal arrays (same items, different class)',
				value1: new Int32Array([1, 2, 3]),
				value2: new Int16Array([1, 2, 3]),
				equal: false,
			},
			{
				name: 'not equal arrays (different item)',
				value1: new Int32Array([1, 2, 3]),
				value2: new Int32Array([1, 2, 4]),
				equal: false,
			},
			{
				name: 'not equal arrays (different length)',
				value1: new Int32Array([1, 2, 3]),
				value2: new Int32Array([1, 2]),
				equal: false,
			},
			{
				name: 'pseudo array and equivalent typed array are not equal',
				value1: {
					0: 1, 1: 2, length: 2, constructor: Int32Array,
				},
				value2: new Int32Array([1, 2]),
				equal: false,
			},
			{
				name: 'equal subviews into different buffers',
				value1: new Uint8Array(new ArrayBuffer(16), 4, 4),
				value2: new Uint8Array(new ArrayBuffer(8), 0, 4),
				equal: true,
			},
			{
				name: 'not equal subviews at different offsets of the same-content buffer',
				value1: (() => {
					const buf = new Uint8Array([0, 0, 0, 0, 1, 2, 3, 4]);
					return new Uint8Array(buf.buffer, 0, 4);
				})(),
				value2: (() => {
					const buf = new Uint8Array([0, 0, 0, 0, 1, 2, 3, 4]);
					return new Uint8Array(buf.buffer, 4, 4);
				})(),
				equal: false,
			},
		],
	},
	{
		name: 'Data views',
		tests: [
			{
				name: 'two empty views are equal',
				value1: new DataView(new Uint16Array([]).buffer),
				value2: new DataView(new Uint16Array([]).buffer),
				equal: true,
			},
			{
				name: 'equal views',
				value1: new DataView(new Uint16Array([1, 2, 3]).buffer),
				value2: new DataView(new Uint16Array([1, 2, 3]).buffer),
				equal: true,
			},
			{
				name: 'not equal views (different item)',
				value1: new DataView(new Uint16Array([1, 2, 3]).buffer),
				value2: new DataView(new Uint16Array([1, 3, 3]).buffer),
				equal: false,
			},
			{
				name: 'not equal views (different length)',
				value1: new DataView(new Uint16Array([1, 2, 3]).buffer),
				value2: new DataView(new Uint16Array([1, 2]).buffer),
				equal: false,
			},
			{
				name: 'equal DataView subviews into larger buffers',
				value1: new DataView(new ArrayBuffer(16), 4, 4),
				value2: new DataView(new ArrayBuffer(8), 0, 4),
				equal: true,
			},
			{
				name: 'not equal DataView subviews at different offsets',
				value1: (() => {
					const buf = new ArrayBuffer(8);
					new Uint8Array(buf).set([0, 0, 0, 0, 1, 2, 3, 4]);
					return new DataView(buf, 0, 4);
				})(),
				value2: (() => {
					const buf = new ArrayBuffer(8);
					new Uint8Array(buf).set([0, 0, 0, 0, 1, 2, 3, 4]);
					return new DataView(buf, 4, 4);
				})(),
				equal: false,
			},
		],
	},
	{
		name: 'Typed arrays',
		tests: [
			{
				name: 'two empty arrays',
				value1: new Uint16Array([]),
				value2: new Uint16Array([]),
				equal: true,
			},
			{
				name: 'equal arrays',
				value1: new Uint16Array([1, 2, 3]),
				value2: new Uint16Array([1, 2, 3]),
				equal: true,
			},
			{
				name: 'not equal arrays (different item)',
				value1: new Uint16Array([1, 2, 3]),
				value2: new Uint16Array([1, 3, 3]),
				equal: false,
			},
			{
				name: 'not equal arrays (different length)',
				value1: new Uint16Array([1, 2, 3]),
				value2: new Uint16Array([1, 2]),
				equal: false,
			},
		],
	},
	{
		name: 'Array buffers',
		tests: [
			{
				name: 'two empty buffers',
				value1: new Uint16Array([]).buffer,
				value2: new Uint16Array([]).buffer,
				equal: true,
			},
			{
				name: 'equal buffers',
				value1: new Uint16Array([1, 2, 3]).buffer,
				value2: new Uint16Array([1, 2, 3]).buffer,
				equal: true,
			},
			{
				name: 'not equal buffers (different item)',
				value1: new Uint16Array([1, 2, 3]).buffer,
				value2: new Uint16Array([1, 3, 3]).buffer,
				equal: false,
			},
			{
				name: 'not equal buffers (different length)',
				value1: new Uint16Array([1, 2, 3]).buffer,
				value2: new Uint16Array([1, 2]).buffer,
				equal: false,
			},
		],
	},
];
