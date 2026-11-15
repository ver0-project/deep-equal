// these are only ever compared by identity and invoked as methods of their owner.
// oxlint-disable-next-line typescript/unbound-method
const {valueOf, toString} = Object.prototype;
// SharedArrayBuffer requires cross-origin isolation headers in browsers;
// guard against environments where it is not defined.
const SAB = globalThis.SharedArrayBuffer ?? Symbol('unavailable');

// recursion stops this many object pairs deep; deeper pairs wait in `deferred` until the outermost pair has compared
// everything above them, so neither nesting depth nor cycle length can exhaust the call stack.
const DEPTH_LIMIT = 1000;

// `classes` links objects that must equal each other because they were both compared with one object; a class root has
// no link. `deferred` holds the pairs met at DEPTH_LIMIT, flattened.
// oxlint-disable-next-line typescript/no-restricted-types
type Visited = WeakMap<object, object> & {classes?: Map<unknown, unknown>; deferred?: unknown[]};

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

const inner = (a: any, b: any, visited: Visited | undefined, depth: number): boolean => {
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

	// if constructors are different, objects are definitely not equal.
	if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
		return false;
	}

	const {constructor} = a;

	switch (constructor) {
		case Date: {
			return a.getTime() === b.getTime();
		}

		case RegExp: {
			return a.source === b.source && a.flags === b.flags;
		}

		case Set: {
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

		case SAB:
		case ArrayBuffer: {
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

	// lazily initialize WeakMap — avoids allocation when comparing non-recursive types
	visited ??= new WeakMap();
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

	switch (constructor) {
		case Array: {
			if (a.length !== b.length) {
				return false;
			}

			for (let i = a.length; i-- !== 0;) {
				if (!inner(a[i], b[i], visited, depth + 1)) {
					return false;
				}
			}

			return depth !== 0 || drain(visited);
		}

		case Map: {
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

		default: {
			break;
		}
	}

	// at this point, we've handled all possible data containers and we can compare objects as plain.

	if (typeof a.valueOf === 'function' && a.valueOf !== valueOf && a.valueOf === b.valueOf) {
		const aVal = a.valueOf();
		const bVal = b.valueOf();
		// oxlint-disable-next-line no-self-compare
		return aVal === bVal || (aVal !== aVal && bVal !== bVal);
	}

	if (typeof a.toString === 'function' && a.toString !== toString && a.toString === b.toString) {
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
