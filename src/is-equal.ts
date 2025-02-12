import {
	compareArrays,
	compareDataVies,
	compareDates,
	compareMaps,
	comparePlainObjects,
	compareRegExps,
	compareSets,
} from './comparators.js';

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

		// avoid jumping into infinite recursion, performing strict equality check.
		if (visited.has(a) && visited.get(a) === b) {
			return true;
		}
		// mark objects as visited.
		visited.set(a, b);

		// assuming that both of objects are of the same we can perform switch based on the type of first object.
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (toString.call(a)) {
			case '[object Array]': {
				return compareArrays(a, b, inner);
			}

			case '[object Date]': {
				return compareDates(a, b);
			}

			case '[object RegExp]': {
				return compareRegExps(a, b);
			}

			case '[object Map]': {
				return compareMaps(a, b, inner);
			}

			case '[object Set]': {
				return compareSets(a, b);
			}

			case '[object DataView]': {
				return compareDataVies(a, b);
			}

			case '[object ArrayBuffer]': {
				return compareDataVies(new DataView(a), new DataView(b));
			}
		}

		// in case we've got here - we're dealing with TypedArray.
		// cast it to DataView and compare byte-wise.
		if (ArrayBuffer.isView(a)) {
			return compareDataVies(new DataView(a.buffer), new DataView(b.buffer));
		}

		// custom valueOf handling
		if (a.valueOf !== valueOf && typeof a.valueOf === 'function' && typeof b.valueOf === 'function') {
			return a.valueOf() === b.valueOf();
		}

		// custom toString handling.
		// not completely sure if it is correct to compare.
		if (a.toString !== toString && typeof a.toString === 'function' && typeof b.toString === 'function') {
			return a.toString() === b.toString();
		}

		// at this point, we've handled all possible data containers
		return comparePlainObjects(a, b, inner);
	};

	return inner(a, b);
};
