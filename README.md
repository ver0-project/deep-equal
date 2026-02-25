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

Many deep equality solutions exist, but they often have limitations:

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

### Comparison Behavior

#### Primitives and Special Values

Primitive values (numbers, strings, booleans, `undefined`, `null`) are compared using strict equality (`===`).

`NaN` is a special case — JavaScript's `===` operator considers `NaN !== NaN`, but `isEqual` treats two `NaN` values
as equal. This also applies to boxed NaN values: `isEqual(Object(NaN), Object(NaN))` returns `true`.

Boxed primitives (`new Number()`, `new String()`, `new Boolean()`) are compared by their underlying value using
`valueOf()`.

#### Objects

Two objects are first checked for matching prototypes — if their prototypes differ, they are not equal.

Then, both objects must have the same number of own enumerable string-keyed properties. Each property value is compared
recursively.

**Symbol-keyed properties are not compared.** Symbols are designed to be non-enumerable identifiers — they serve as
hidden metadata rather than data-carrying properties. Well-known symbols like `Symbol.iterator` define behavior, and
framework-specific symbols like `$$typeof` are internal markers. Comparing them as data would contradict their intended
role in the language.

#### Arrays

Arrays must have the same `length`. Each element is compared recursively by index.

#### Sets

A `Set` is an implementation of a mathematical set — an unordered collection of unique values. The fact that JavaScript
preserves insertion order during iteration is a convenience of the specification, not a defining characteristic. A Set
is not an array, and comparing it like one would be incorrect.

Sets must have the same `size`. Membership is checked using the Set's built-in `has()` method, which uses the
[SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality)
algorithm. Order is irrelevant.

```javascript
// Order does not matter
isEqual(new Set([1, 2, 3]), new Set([3, 1, 2])); // true

// Object references — compared by identity, not structure
isEqual(new Set([{a: 1}]), new Set([{a: 1}])); // false
```

**Object elements are compared by reference, not by deep equality.** This follows from how the Set itself defines
uniqueness. A Set uses SameValueZero to determine whether a value already exists — you can add 100 structurally
identical objects and the Set will hold all 100 as distinct elements. Deep-comparing elements would impose an identity
model that contradicts the container's own semantics. `isEqual` respects the data structure's definition of membership
rather than overriding it.

#### Maps

A `Map` is a key-value collection where keys are identified by SameValueZero — the same identity model as Sets. Just
like with Sets, this means object keys are distinct references, not interchangeable structures. Two structurally
identical objects used as Map keys are two different keys as far as the Map is concerned.

Maps must have the same `size`. **Keys are compared by reference** using the Map's built-in `has()` method, while
**values are deep-compared** recursively.

```javascript
// Primitive keys — works as expected
isEqual(new Map([['a', {x: 1}]]), new Map([['a', {x: 1}]])); // true

// Object keys — compared by identity, not structure
const k1 = {id: 1};
const k2 = {id: 1};
isEqual(new Map([[k1, 'v']]), new Map([[k2, 'v']])); // false
```

The reasoning is the same as for Sets — `isEqual` respects the Map's own definition of key identity rather than
overriding it.

#### Dates and Regular Expressions

Dates are compared by their timestamp value (`getTime()`). Regular expressions are compared by their `source` and
`flags` properties.

#### TypedArrays, DataViews, and ArrayBuffers

All binary data types — `ArrayBuffer`, `SharedArrayBuffer`, `DataView`, and all TypedArray variants — are compared at
the byte level using `Uint8Array`.

For TypedArrays and DataViews, only the viewed slice is compared. The `byteOffset` and `byteLength` of the view are
respected, so two views into the same underlying buffer that cover different regions are correctly identified as
different.

Byte-level comparison has a correctness advantage: it preserves NaN bit patterns. A `Float64Array([NaN])` compared
element-by-element would fail because `NaN !== NaN`, but comparing the underlying bytes works correctly.

#### Custom Classes

When two objects share the same prototype but don't match any of the built-in types above, `isEqual` checks whether
the class defines a custom `valueOf()` or `toString()` method.

If `valueOf()` is present, differs from `Object.prototype.valueOf`, and **both instances share the same function
reference** (which is naturally true for prototype methods), the comparison is performed by calling `valueOf()` on each
instance and comparing the results. The same logic applies as a fallback to `toString()`.

This is a **terminal comparison** — if `valueOf()` or `toString()` is used, own properties are not checked afterward.
The rationale is that a class defining `valueOf()` is declaring "this is my primitive representation," and that
representation is the basis for equality.

Classes that don't define custom `valueOf()` or `toString()` fall through to property-by-property comparison, just like
plain objects.

#### Circular References

Circular and cross-references between objects are handled correctly. Visited object pairs are tracked during recursion
to detect cycles, so self-referential structures are compared without infinite loops.

### Performance

Check out the benchmarks by running `yarn benchmark` in the project directory.

> Unlike most deep equality libraries, this package supports circular reference detection. This requires tracking
> visited object pairs during recursion, which adds overhead on recursive structures (objects, arrays, maps).
>
> To minimize this cost, the tracking mechanism is lazily allocated — comparisons of leaf types like dates, regular
> expressions, sets, and typed arrays have zero tracking overhead. The cost is only paid when recursion actually occurs.
>
> Rather than splitting into separate functions (one with cycle detection, one without), this package provides a single
> function that handles all cases. Simplicity in both the API and the implementation.

### Supported Types

- Primitive values (numbers, strings, booleans, undefined, null)
- NaN (correctly compared to be equal to itself)
- Boxed primitives (Number objects, String objects, Boolean objects)
- Plain objects
- Arrays
- Sets
- Maps
- Regular Expressions
- Date objects
- ArrayBuffers
- SharedArrayBuffers
- DataViews
- TypedArrays (Int8Array, Uint8Array, Float64Array, etc.)
- Objects with null prototypes
- Objects with custom `valueOf()` / `toString()`
- Any objects with circular references
