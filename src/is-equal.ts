// these are only ever compared by identity and invoked as methods of their owner.
// oxlint-disable-next-line typescript/unbound-method
const {valueOf, toString} = Object.prototype;
// SharedArrayBuffer requires cross-origin isolation headers in browsers;
// guard against environments where it is not defined.
const SAB = globalThis.SharedArrayBuffer ?? Symbol('unavailable');

// oxlint-disable-next-line typescript/no-restricted-types
const inner = (a: any, b: any, visited: WeakMap<object, object> | undefined): boolean => {
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

	// Track visited pairs to handle circular and cross references.
	// b is a non-null object here, so a miss (undefined) can never match it.
	if (visited?.get(a) === b) {
		return true;
	}

	// lazily initialize WeakMap — avoids allocation when comparing non-recursive types
	(visited ??= new WeakMap()).set(a, b);

	switch (constructor) {
		case Array: {
			if (a.length !== b.length) {
				return false;
			}

			for (let i = a.length; i-- !== 0;) {
				if (!inner(a[i], b[i], visited)) {
					return false;
				}
			}

			return true;
		}

		case Map: {
			if (a.size !== b.size) {
				return false;
			}

			// prototypes matched above, so b is a Map of the same kind.
			const bMap = b as Map<unknown, unknown>;

			for (const entry of a) {
				if (!bMap.has(entry[0]) || !inner(entry[1], bMap.get(entry[0]), visited)) {
					return false;
				}
			}

			return true;
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

	let key;
	for (let l = aKeys.length; l-- !== 0;) {
		key = aKeys[l];
		if (!Object.hasOwn(b, key) || !inner(a[key], b[key], visited)) {
			return false;
		}
	}

	return true;
};

export const isEqual = (a: any, b: any): boolean => inner(a, b, undefined);
