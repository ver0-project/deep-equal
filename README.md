<div align="center">
<h1>@ver0/deep-equal</h1>

[![NPM Version](https://img.shields.io/npm/v/%40ver0%2Fdeep-equal?style=flat-square)](https://www.npmjs.com/package/@ver0/deep-equal)
[![NPM Downloads](https://img.shields.io/npm/dm/%40ver0%2Fdeep-equal?style=flat-square)](https://www.npmjs.com/package/@ver0/deep-equal)
[![Dependents (via libraries.io), scoped npm package](https://img.shields.io/librariesio/dependents/npm/%40ver0/deep-equal?style=flat-square)](https://www.npmjs.com/package/@ver0/deep-equal)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/ver0-project/deep-equal/ci.yml?style=flat-square)](https://github.com/ver0-project/deep-equal/actions)
[![Codecov](https://img.shields.io/codecov/c/github/ver0-project/deep-equal?token=Y2K96S71RH&style=flat-square)](https://app.codecov.io/gh/ver0-project/deep-equal)
[![NPM Type Definitions](https://img.shields.io/npm/types/%40ver0%2Fdeep-equal?style=flat-square)](https://www.npmjs.com/package/@ver0/deep-equal)

<p><br/>🔍 Deep values comparator for JavaScript</p>
</div>

### Features

- ✅ Handles circular references correctly
- ✅ Supports all modern JS data types
- ✅ Correctly handles special cases like NaN comparisons
- ✅ Lightweight with zero dependencies
- ✅ Fast, while handling all cases

### Why this package exists?

When comparing objects in JavaScript, the built-in equality operators (`==` and `===`) only check for reference
equality, not structural equality. This means that two objects with the same properties and values will be considered
different if they're not the same instance.

Many deep equality solutions exist (like lodash's `isEqual`, fast-deep-equal, and others), but they often have
limitations:

- Some don't handle circular references
- Some have inconsistent behavior with special values like NaN
- Some don't support newer JavaScript features or types

This package aims to provide a comprehensive **single** solution that addresses all these concerns while maintaining
excellent performance.

### Installation

```bash
# Using npm
npm install @ver0/deep-equal

# Using yarn
yarn add @ver0/deep-equal

# Using pnpm
pnpm add @ver0/deep-equal
```

### How to use

The API is extremely simple - just import the `isEqual` function and use it to compare any two values:

```javascript
import {isEqual} from '@ver0/deep-equal';

// Comparing objects
isEqual({a: 1, b: 2}, {a: 1, b: 2}); // true
isEqual({a: 1, b: 2}, {a: 1, b: 3}); // false

// Handling circular references
const obj1 = {a: 1};
const obj2 = {a: 1};
obj1.self = obj1;
obj2.self = obj2;
isEqual(obj1, obj2); // true

// Works with various data types and containers
isEqual(new Date('2023-01-01'), new Date('2023-01-01')); // true
isEqual(new Set([1, 2]), new Set([1, 2])); // true
isEqual(new Map([['a', 1]]), new Map([['a', 1]])); // true
isEqual(/abc/g, /abc/g); // true

// Correctly handles special cases
isEqual(NaN, NaN); // true
```

### Performance

Check out the benchmarks by running `npm run benchmark` in the project directory.

> While benchmark results may show this package isn't the fastest solution available, this is a deliberate trade-off.
>
> The performance cost comes from supporting circular reference detection. Rather than splitting this into separate
> functions, I've prioritized simplicity in both the API design and implementation, eliminating the need for users to
> choose between different comparison functions.

### Supported Types

- Primitive values (numbers, strings, booleans, undefined, null)
- NaN (correctly compared to be equal to itself)
- Plain objects
- Arrays
- Sets
- Maps
- Regular Expressions
- Date objects
- ArrayBuffers
- TypedArrays (Int8Array, Uint8Array, etc.)
- Objects with null prototypes
- Any objects with circular references
