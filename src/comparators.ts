type EqualPredicate = (a: any, b: any) => boolean;

export const compareArrays = (a: any[], b: any[], isEqual: EqualPredicate): boolean => {
	if (a.length !== b.length) {
		return false;
	}

	for (let i = a.length; i-- !== 0; ) {
		if (!isEqual(a[i], b[i])) {
			return false;
		}
	}

	return true;
};

export const comparePlainObjects = (
	a: Record<string, unknown>,
	b: Record<string, unknown>,
	isEqual: EqualPredicate
): boolean => {
	const aKeys = Object.keys(a);
	let key;
	for (let l = aKeys.length; l-- !== 0; ) {
		key = aKeys[l];
		if (!Object.hasOwn(b, key) || !isEqual(a[key], b[key])) {
			return false;
		}
	}

	return Object.keys(b).length === aKeys.length;
};

export const compareDates = (a: Date, b: Date): boolean => a.getTime() === b.getTime();

export const compareRegExps = (a: RegExp, b: RegExp): boolean => a.source === b.source && a.flags === b.flags;

export const compareMaps = (a: Map<any, any>, b: Map<any, any>, isEqual: EqualPredicate): boolean => {
	if (a.size !== b.size) {
		return false;
	}

	for (const entry of a) {
		if (!b.has(entry[0]) || !isEqual(entry[1], b.get(entry[0]))) {
			return false;
		}
	}

	return true;
};

export const compareSets = (a: Set<any>, b: Set<any>): boolean => {
	if (a.size !== b.size) {
		return false;
	}

	for (const value of a) {
		if (!b.has(value)) {
			return false;
		}
	}

	return true;
};

export const compareArrayBuffers = (a: ArrayLike<number>, b: ArrayLike<number>): boolean => {
	if (a.length !== b.length) return false;

	for (let i = a.length; i-- !== 0; ) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
};

export const compareDataVies = (a: DataView, b: DataView): boolean => {
	const {byteLength} = a;

	if (byteLength !== b.byteLength) {
		return false;
	}

	for (let i = byteLength; i-- !== 0; ) {
		if (a.getUint8(i) !== b.getUint8(i)) {
			return false;
		}
	}

	return true;
};
