export type BenchmarkSuite = {name: string; data: [any, any]};

export const simple: BenchmarkSuite[] = [
	{
		name: 'mixed (equal)',
		data: [
			{
				prop1: 'value1',
				prop2: 'value2',
				prop3: 'value3',
				prop4: {
					subProp1: 'sub value1',
					subProp2: {
						subSubProp1: 'sub sub value1',
						subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5, ...Array.from({length: 50}).fill('b')],
					},
				},
				prop5: 1000,
				prop6: new Date(2016, 2, 10),
			},
			{
				prop5: 1000,
				prop3: 'value3',
				prop1: 'value1',
				prop2: 'value2',
				prop6: new Date('2016/03/10'),
				prop4: {
					subProp2: {
						subSubProp1: 'sub sub value1',
						subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5, ...Array.from({length: 50}).fill('b')],
					},
					subProp1: 'sub value1',
				},
			},
		],
	},
	{
		name: 'mixed (inequal)',
		data: [
			{
				prop1: 'value1',
				prop2: 'value2',
				prop3: 'value3',
				prop4: {
					subProp1: 'sub value1',
					subProp2: {
						subSubProp1: 'sub sub value1',
						subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5, ...Array.from({length: 50}).fill('b')],
					},
				},
				prop5: 1000,
				prop6: new Date(2016, 2, 10),
			},
			{
				prop5: 1000,
				prop3: 'value3',
				prop1: 'value1',
				prop2: 'value2',
				prop6: new Date('2016/03/10'),
				prop4: {
					subProp2: {
						subSubProp1: 'sub sub value1',
						subSubProp2: [1, 2, {prop2: 1, prop: 4}, 4, 5, ...Array.from({length: 50}).fill('b')],
					},
					subProp1: 'sub value1',
				},
			},
		],
	},
	{
		name: 'arrays (equal)',
		data: [
			[1, ['foo', 'bar'], 'a', ...Array.from({length: 50}).fill('b')],
			[1, ['foo', 'bar'], 'a', ...Array.from({length: 50}).fill('b')],
		],
	},
	{
		name: 'arrays (inequal)',
		data: [
			[1, ['foo', 'bar'], 'a', ...Array.from({length: 50}).fill('b')],
			[1, ['foo', 'baz'], 'a', ...Array.from({length: 50}).fill('b')],
		],
	},
	{
		name: 'objects (equal)',
		data: [
			{a: 1, foo: 'bar', bax: 'qux'},
			{a: 1, bax: 'qux', foo: 'bar'},
		],
	},
	{
		name: 'objects (inequal)',
		data: [
			{a: 1, foo: 'bar', bax: 'qux'},
			{a: 1, bax: 'qux', foo: 2},
		],
	},
	{
		name: 'dates (equal)',
		data: [new Date('2021-01-01'), new Date('2021-01-01')],
	},
	{
		name: 'dates (inequal)',
		data: [new Date('2021-01-01'), new Date('2021-01-02')],
	},
	{
		name: 'regexps (equal)',
		data: [/[a-c]+/, /[a-c]+/],
	},
	{
		name: 'regexps (inequal)',
		data: [/[a-c]+/, /[a-d]+/],
	},
];

export const complex: BenchmarkSuite[] = [
	{
		name: 'mixed (equal)',
		data: [
			{
				foo: 'value1',
				bar: new Set([1, 2, 3]),
				baz: /foo/i,
				bat: {
					hello: new Map([['hello', 'world']]),
					world: {
						aaa: new Map([['foobar', 'sub sub value1']]),
						bbb: [1, 2, {prop2: 1, prop: 2}, 4, 5],
					},
				},

				qut: new Date(2016, 2, 10),
				qar: new Uint8Array([1, 2, 3, 4, 5]),
			},
			{
				baz: /foo/i,
				foo: 'value1',
				bar: new Set([1, 2, 3]),
				qar: new Uint8Array([1, 2, 3, 4, 5]),
				qut: new Date('2016/03/10'),
				bat: {
					world: {
						aaa: new Map([['foobar', 'sub sub value1']]),
						bbb: [1, 2, {prop2: 1, prop: 2}, 4, 5],
					},
					hello: new Map([['hello', 'world']]),
				},
			},
		],
	},
	{
		name: 'mixed (inequal)',
		data: [
			{
				foo: 'value1',
				bar: new Set([1, 2, 3]),
				baz: /foo/i,
				bat: {
					hello: new Map([['hello', 'world']]),
					world: {
						aaa: new Map([['foobar', 'sub sub value1']]),
						bbb: [1, 2, {prop2: 1, prop: 2}, 4, 5],
					},
				},
				qut: new Date(2016, 2, 10),
				qar: new Uint8Array([1, 2, 3, 4, 5]),
			},
			{
				baz: /foo/i,
				foo: 'value1',
				bar: new Set([1, 2, 3]),
				qar: new Uint8Array([1, 2, 3, 4, 5]),
				qut: new Date('2016/03/10'),
				bat: {
					world: {
						aaa: new Map([['foobar', 'sub sub value1']]),
						bbb: [1, 2, {prop2: 1, prop: 2}, 4, 8],
					},
					hello: new Map([['hello', 'world']]),
				},
			},
		],
	},
	{
		name: 'maps (equal)',
		data: [
			new Map(Array.from({length: 100}, (_v, idx) => [idx, idx])),
			new Map(Array.from({length: 100}, (_v, idx) => [idx, idx])),
		],
	},
	{
		name: 'maps (inequal)',
		data: [
			new Map(Array.from({length: 100}, (_v, idx) => [idx, idx])),
			new Map([
				...Array.from({length: 49}, (_v, idx) => [idx, idx]),
				[50, 0],
				...Array.from({length: 50}, (_v, idx) => [idx + 50, idx]),
			] as Array<[number, number]>),
		],
	},
	{
		name: 'sets (equal)',
		data: [new Set(Array.from({length: 100}, (_v, idx) => idx)), new Set(Array.from({length: 100}, (_v, idx) => idx))],
	},
	{
		name: 'sets (inequal)',
		data: [
			new Set(Array.from({length: 100}, (_v, idx) => idx)),
			new Set([...Array.from({length: 49}, (_v, idx) => idx), 1, ...Array.from({length: 50}, (_v, idx) => idx + 50)]),
		],
	},
	// not all benchmarked packages are able to compare data views
	// {
	// 	name: 'data views (equal)',
	// 	data: [
	// 		new DataView(new Uint16Array(Array.from({length: 50}).fill(2) as number[]).buffer),
	// 		new DataView(new Uint16Array(Array.from({length: 50}).fill(2) as number[]).buffer),
	// 	],
	// },
	// {
	// 	name: 'data views (inequal)',
	// 	data: [
	// 		new DataView(new Uint16Array(Array.from({length: 50}).fill(2) as number[]).buffer),
	// 		new DataView(new Uint16Array([
	// 			...Array.from({length: 25}).fill(2) as number[],
	// 			1,
	// 			...Array.from({length: 24}).fill(2) as number[],
	// 		]).buffer),
	// 	],
	// },
	{
		name: 'array buffers (equal)',
		data: [
			new Uint16Array(Array.from({length: 50}).fill(2) as number[]),
			new Uint16Array(Array.from({length: 50}).fill(2) as number[]),
		],
	},
	{
		name: 'array buffers (inequal)',
		data: [
			new Uint16Array(Array.from({length: 50}).fill(2) as number[]),
			new Uint16Array([
				...(Array.from({length: 25}).fill(2) as number[]),
				1,
				...(Array.from({length: 24}).fill(2) as number[]),
			]),
		],
	},
];
