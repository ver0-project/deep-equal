// these are only ever compared by identity and invoked as methods of their owner.
// oxlint-disable-next-line typescript/unbound-method
const {valueOf, toString} = Object.prototype;
// SharedArrayBuffer requires cross-origin isolation headers in browsers;
// guard against environments where it is not defined.
const SAB = globalThis.SharedArrayBuffer ?? Symbol('unavailable');
const sabPrototype = typeof SAB === 'function' ? SAB.prototype : SAB;

// recursion stops this many object pairs deep; deeper pairs wait in `deferred` until the outermost pair has compared
// everything above them, so neither nesting depth nor cycle length can exhaust the call stack.
const DEPTH_LIMIT = 1000;

// `classes` links objects that must equal each other because they were both compared with one object; a class root has
// no link. `deferred` holds the pairs met at DEPTH_LIMIT, flattened.
// oxlint-disable-next-line typescript/no-restricted-types
type Visited = Map<object, object> & {classes?: Map<unknown, unknown>; deferred?: unknown[]};

// path halving relinks every other node on the way to its grandparent, which keeps later walks short.
const rootOf = (classes: Map<unknown, unknown>, value: unknown): unknown => {
	let node = value;
	let parent = classes.get(node);
	while (parent !== undefined) {
		const grandparent = classes.get(parent);
		if (grandparent === undefined) {
			return parent;
		}

		classes.set(node, grandparent);
		node = grandparent;
		parent = classes.get(node);
	}

	return node;
};

const builtinOf = (value: unknown): unknown => {
	if (value instanceof Map) {
		return Map.prototype;
	}

	if (value instanceof Set) {
		return Set.prototype;
	}

	// the switches in `inner` match this realm's prototypes only; Array.isArray would also take another realm's arrays.
	// oxlint-disable-next-line unicorn/no-instanceof-array, unicorn/no-instanceof-builtins
	if (value instanceof Array) {
		return Array.prototype;
	}

	if (value instanceof ArrayBuffer) {
		return ArrayBuffer.prototype;
	}

	if (typeof SAB === 'function' && value instanceof SAB) {
		return sabPrototype;
	}

	return undefined;
};

// constraint: V8 keeps type feedback per code site, so another realm's arrays, Maps and Sets read by the loops in `inner`
// slow down every later comparison of this realm's ones; they are compared as this realm's copies.
const otherRealmArray = Symbol('array from another realm');
const otherRealmMap = Symbol('Map from another realm');

// constraint: this realm's `size` and `byteLength` getters read an internal slot, which instances from every realm
// carry, and throw for any other value.
const hasSlot = (
	owner: Map<unknown, unknown> | Set<unknown> | ArrayBufferLike,
	getter: string,
	value: unknown,
): boolean => {
	try {
		Reflect.get(owner, getter, value);
		return true;
	} catch {
		return false;
	}
};

const otherRealmBuiltinOf = (value: any): unknown => {
	if (Array.isArray(value)) {
		return otherRealmArray;
	}

	let tag: unknown;
	try {
		tag = value[Symbol.toStringTag];
	} catch {
		tag = null;
	}

	switch (tag) {
		case undefined: {
			return undefined;
		}

		case 'Map': {
			return hasSlot(Map.prototype, 'size', value) ? otherRealmMap : undefined;
		}

		case 'Set': {
			return hasSlot(Set.prototype, 'size', value) ? Set.prototype : undefined;
		}

		case 'ArrayBuffer': {
			return hasSlot(ArrayBuffer.prototype, 'byteLength', value) ? ArrayBuffer.prototype : undefined;
		}

		case 'SharedArrayBuffer': {
			return typeof SAB === 'function' && hasSlot(SAB.prototype, 'byteLength', value) ? sabPrototype : undefined;
		}

		default: {
			// constraint: a subclass can replace its Symbol.toStringTag, but its chain still holds the `size` or
			// `byteLength` of the built-in it extends.
			if ('size' in value) {
				if (hasSlot(Map.prototype, 'size', value)) {
					return otherRealmMap;
				}

				if (hasSlot(Set.prototype, 'size', value)) {
					return Set.prototype;
				}
			}

			if ('byteLength' in value) {
				if (hasSlot(ArrayBuffer.prototype, 'byteLength', value)) {
					return ArrayBuffer.prototype;
				}

				if (typeof SAB === 'function' && hasSlot(SAB.prototype, 'byteLength', value)) {
					return sabPrototype;
				}
			}

			return undefined;
		}
	}
};

// constraint: a realm's Object.prototype is the prototype of that realm's Function.prototype, which is the prototype of
// the Object constructor it holds. A chain that ends anywhere else gets undefined.
const realmObjectPrototypeOf = (prototype: unknown): any => {
	let end: any = prototype;
	for (let next = Object.getPrototypeOf(end); next !== null; next = Object.getPrototypeOf(end)) {
		end = next;
	}

	const realmObject: unknown = end.constructor;
	if (typeof realmObject !== 'function') {
		return undefined;
	}

	const realmFunctionPrototype = Object.getPrototypeOf(realmObject);
	return realmFunctionPrototype !== null && Object.getPrototypeOf(realmFunctionPrototype) === end ? end : undefined;
};

const inner = (a: any, b: any, visited: Visited | undefined, depth: number, builtin?: unknown): boolean => {
	// in case strict equality - there is nothing to check anymore.
	if (a === b) {
		return true;
	}

	// in case any of values is not an object, there is nothing to do, except to check strict equality.
	// null is the only falsy value left once typeof said 'object'.
	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
		// looks weird, but it is most efficient way to test NaN.
		// otherwise we have to involve Number.isNaN, which causes context switch and therefore is slower.
		// oxlint-disable-next-line no-self-compare
		return a !== a && b !== b;
	}

	const prototype = Object.getPrototypeOf(a);
	if (prototype !== Object.getPrototypeOf(b)) {
		return false;
	}

	const kind = builtin ?? prototype;
	let realmValueOf: unknown = valueOf;
	let realmToString: unknown = toString;

	switch (kind) {
		case Date.prototype: {
			return a.getTime() === b.getTime();
		}

		case RegExp.prototype: {
			return a.source === b.source && a.flags === b.flags;
		}

		case Set.prototype: {
			if (a.size !== b.size) {
				return false;
			}

			// prototypes matched above, so b is a Set of the same kind.
			const bSet = b as Set<unknown>;

			for (const value of a) {
				if (!bSet.has(value)) {
					return false;
				}
			}

			return true;
		}

		case sabPrototype:
		case ArrayBuffer.prototype: {
			const a8 = new Uint8Array(a);
			const b8 = new Uint8Array(b);

			if (a8.length !== b8.length) {
				return false;
			}

			for (let i = a8.length; i-- !== 0;) {
				if (a8[i] !== b8[i]) {
					return false;
				}
			}

			return true;
		}

		default: {
			if (ArrayBuffer.isView(a)) {
				const a8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
				const b8 = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);

				if (a8.length !== b8.length) {
					return false;
				}

				for (let i = a8.length; i-- !== 0;) {
					if (a8[i] !== b8[i]) {
						return false;
					}
				}

				return true;
			}

			if (builtin === undefined && kind !== Object.prototype && kind !== Array.prototype && kind !== Map.prototype) {
				let base = builtinOf(a);
				if (base === undefined && prototype !== null && !(a instanceof Object)) {
					const realmObjectPrototype = realmObjectPrototypeOf(prototype);
					if (realmObjectPrototype !== undefined) {
						base = otherRealmBuiltinOf(a);
						if (base !== otherRealmBuiltinOf(b)) {
							return false;
						}

						if (base === Set.prototype) {
							a = new Set(a);
							b = new Set(b);
						}

						realmValueOf = realmObjectPrototype.valueOf;
						realmToString = realmObjectPrototype.toString;
					}
				}

				if (base !== undefined) {
					return inner(a, b, visited, depth, base);
				}
			}
		}
	}

	if (depth === DEPTH_LIMIT) {
		// the pairs above this one created visited.
		(visited!.deferred ??= []).push(a, b);
		return true;
	}

	// Track visited pairs to handle circular and cross references.
	const seen = visited?.get(a);
	// b is a non-null object here, so a miss (undefined) can never match it.
	if (seen === b) {
		return true;
	}

	// lazily initialize the map — avoids allocation when comparing non-recursive types
	visited ??= new Map();
	if (seen === undefined) {
		visited.set(a, b);
	} else {
		// a equals seen and is now compared with b, so b has to equal seen as well.
		visited.classes ??= new Map();
		const seenRoot = rootOf(visited.classes, seen);
		const bRoot = rootOf(visited.classes, b);
		if (seenRoot === bRoot) {
			return true;
		}

		visited.classes.set(bRoot, seenRoot);
	}

	switch (kind) {
		case Array.prototype: {
			if (a.length !== b.length) {
				return false;
			}

			// constraint: an object that only inherits from Array.prototype can hold any value in `length`.
			for (let i = Math.min(a.length, 2 ** 32 - 1); i-- > 0;) {
				if (!inner(a[i], b[i], visited, depth + 1)) {
					return false;
				}
			}

			return depth !== 0 || drain(visited);
		}

		case Map.prototype: {
			if (a.size !== b.size) {
				return false;
			}

			// prototypes matched above, so b is a Map of the same kind.
			const bMap = b as Map<unknown, unknown>;

			for (const entry of a) {
				if (!bMap.has(entry[0]) || !inner(entry[1], bMap.get(entry[0]), visited, depth + 1)) {
					return false;
				}
			}

			return depth !== 0 || drain(visited);
		}

		case otherRealmArray: {
			return inner([...a], [...b], visited, depth, Array.prototype);
		}

		case otherRealmMap: {
			return inner(new Map(a), new Map(b), visited, depth, Map.prototype);
		}

		default: {
			break;
		}
	}

	// at this point, we've handled all possible data containers and we can compare objects as plain.

	if (typeof a.valueOf === 'function' && a.valueOf !== realmValueOf && a.valueOf === b.valueOf) {
		const aVal = a.valueOf();
		const bVal = b.valueOf();
		// oxlint-disable-next-line no-self-compare
		return aVal === bVal || (aVal !== aVal && bVal !== bVal);
	}

	if (typeof a.toString === 'function' && a.toString !== realmToString && a.toString === b.toString) {
		return a.toString() === b.toString();
	}

	const aKeys = Object.keys(a);
	if (aKeys.length !== Object.keys(b).length) {
		return false;
	}

	let key: string;
	for (let l = aKeys.length; l-- !== 0;) {
		// the loop index is bounded by aKeys.length, so the entry is always there.
		key = aKeys[l]!;
		if (!Object.hasOwn(b, key) || !inner(a[key], b[key], visited, depth + 1)) {
			return false;
		}
	}

	return depth !== 0 || drain(visited);
};

// deferred pairs start again at depth 1, so pairs they defer in turn are appended here instead of drained by them.
const drain = (visited: Visited): boolean => {
	const {deferred} = visited;
	if (deferred !== undefined) {
		for (let i = 0; i < deferred.length; i += 2) {
			if (!inner(deferred[i], deferred[i + 1], visited, 1)) {
				return false;
			}
		}
	}

	return true;
};

export const isEqual = (a: any, b: any): boolean => inner(a, b, undefined, 0);
