const {valueOf, toString} = Object.prototype;

export const isEqual = (a: any, b: any): boolean => {
	// in order to support circular references we have to keep track of visited objects.
	// for that reason we have to create new function for each invocation.
	const visited = new WeakMap();

	// eslint-disable-next-line complexity
	const inner = (a: any, b: any): boolean => {
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

		if (constructor === Date) {
			return a.getTime() === b.getTime();
		}

		if (constructor === RegExp) {
			return a.source === b.source && a.flags === b.flags;
		}

		if (constructor === Set) {
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

		if (constructor === ArrayBuffer) {
			a = new DataView(a);
			b = new DataView(b);
		}

		if (constructor === DataView || ArrayBuffer.isView(a)) {
			// this is a TypedArray.
			if (constructor !== DataView) {
				a = new DataView(a.buffer);
				b = new DataView(b.buffer);
			}

			if (a.byteLength !== b.byteLength) return false;
			for (let i = a.byteLength; i-- !== 0; ) {
				if (a.getUint8(i) !== b.getUint8(i)) {
					return false;
				}
			}

			return true;
		}

		// Check circular references
		if (visited.has(a) && visited.get(a) === b) {
			return true;
		}

		visited.set(a, b);

		if (constructor === Array) {
			if (a.length !== b.length) {
				return false;
			}

			for (let i = a.length; i-- !== 0; ) {
				if (!inner(a[i], b[i])) {
					return false;
				}
			}

			return true;
		}

		if (constructor === Map) {
			if (a.size !== b.size) {
				return false;
			}

			for (const entry of a) {
				if (!b.has(entry[0]) || !inner(entry[1], b.get(entry[0]))) {
					return false;
				}
			}

			return true;
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
		for (let l = aKeys.length; l-- !== 0; ) {
			key = aKeys[l];
			if (!Object.hasOwn(b, key) || !inner(a[key], b[key])) {
				return false;
			}
		}

		return Object.keys(b).length === aKeys.length;
	};

	return inner(a, b);
};
