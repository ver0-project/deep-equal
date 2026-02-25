const {valueOf, toString} = Object.prototype;

// eslint-disable-next-line complexity, @typescript-eslint/no-restricted-types
const inner = (a: any, b: any, visited: WeakMap<object, object> | undefined): boolean => {
	// in case strict equality - there is nothing to check anymore.
	if (a === b) {
		return true;
	}

	// in case any of values is not an object, there is nothing to do, except to check strict equality.
	if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) {
		// looks weird, but it is most efficient way to test NaN.
		// otherwise we have to involve Number.isNaN, which causes context switch and therefore is slower.
		// eslint-disable-next-line no-self-compare
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

			for (const value of a) {
				if (!b.has(value)) {
					return false;
				}
			}

			return true;
		}

		case SharedArrayBuffer:
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

	// Track visited pairs to handle circular and cross references
	if (visited?.has(a) && visited.get(a) === b) {
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

			for (const entry of a) {
				if (!b.has(entry[0]) || !inner(entry[1], b.get(entry[0]), visited)) {
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

	if (a.valueOf !== valueOf && typeof a.valueOf === 'function' && typeof b.valueOf === 'function') {
		return a.valueOf() === b.valueOf();
	}

	if (a.toString !== toString && typeof a.toString === 'function' && typeof b.toString === 'function') {
		return a.toString() === b.toString();
	}

	const aKeys = Object.keys(a);
	let key;
	for (let l = aKeys.length; l-- !== 0;) {
		key = aKeys[l];
		if (!Object.hasOwn(b, key) || !inner(a[key], b[key], visited)) {
			return false;
		}
	}

	return Object.keys(b).length === aKeys.length;
};

export const isEqual = (a: any, b: any): boolean => inner(a, b, undefined);
