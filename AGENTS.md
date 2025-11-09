# AGENTS.md - Developer & AI Agent Guide

> **Audience**: AI agents, developers, and contributors working on the @ver0/deep-equal codebase **Purpose**:
> Comprehensive technical documentation for understanding, maintaining, and extending the library

---

## Project Overview

**@ver0/deep-equal** is a JavaScript deep equality comparison library that prioritizes **correctness** and \*
\*comprehensive type support\*\* over raw performance.

### Core Design Philosophy

1. **Single API**: One `isEqual(a, b)` function handles all cases (no separate circular-safe variants)
2. **Correctness First**: Proper handling of all edge cases takes priority over speed
3. **Zero Dependencies**: Self-contained implementation
4. **Type Completeness**: Support for all modern JavaScript data types

### Key Features

- Circular reference detection using WeakMap
- Comprehensive type support (primitives, objects, arrays, Maps, Sets, TypedArrays, etc.)
- Correct NaN handling (NaN === NaN returns true)
- Prototype-based type checking
- Custom valueOf/toString support

---

## Architecture & Algorithm

### High-Level Flow

```text
isEqual(a, b)
 ├─ Create WeakMap for circular reference tracking
 ├─ Define inner(a, b) recursive comparison function
 │   ├─ Fast path: strict equality check (a === b)
 │   ├─ Handle non-objects (primitives + NaN)
 │   ├─ Prototype comparison (type checking)
 │   ├─ Type-specific comparisons:
 │   │   ├─ Date → compare timestamps
 │   │   ├─ RegExp → compare source + flags
 │   │   ├─ Set → size check + membership
 │   │   ├─ ArrayBuffer/TypedArray → byte-by-byte
 │   │   ├─ Array → length + recursive element comparison
 │   │   ├─ Map → size check + recursive key/value
comparison
 │   │   └─ Plain objects → keys + recursive value
comparison
 │   ├─ Circular reference check (WeakMap lookup)
 │   └─ Custom valueOf/toString fallback
 └─ Return result
```

### Critical Implementation Details

#### 1. Circular Reference Handling (`src/is-equal.ts:74-79`)

```typescript
// Check circular references
if (visited.has(a) && visited.get(a) === b) {
	return true;
}
visited.set(a, b);
```

**Design Decision**: WeakMap tracks `a ? b` pairs. If we've seen `a` before and it was compared to `b`, assume equality.

**Trade-off**: This introduces overhead for ALL comparisons, even when circular references don't exist. This is the
primary performance cost mentioned in the README.

#### 2. NaN Optimization (`src/is-equal.ts:19-20`)

```typescript
// eslint-disable-next-line no-self-compare
return a !== a && b !== b;
```

**Why not `Number.isNaN()`?** Self-comparison is faster (avoids function call overhead). NaN is the only value where
`x !== x` is true.

#### 3. Prototype-Based Type Checking (`src/is-equal.ts:24-28`)

```typescript
if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
	return false;
}
const {constructor} = a;
```

**Purpose**: Ensures objects are of the same type before detailed comparison. This catches:

- `Date` vs plain object
- `Set` vs `Map`
- Custom classes with different prototypes
- `null`-prototype objects vs regular objects

#### 4. TypedArray Strategy (`src/is-equal.ts:52-72`)

Converts TypedArrays to DataView for byte-level comparison. This provides:

- Universal handling for all TypedArray types
- Correct endianness handling
- Consistent behavior across different typed array constructors

---

## Type Coverage Matrix

| Type                | Comparison Strategy         | Location     | Notes                        |
| ------------------- | --------------------------- | ------------ | ---------------------------- |
| **Primitives**      | `===` strict equality       | Line 11      | Fast path                    |
| **NaN**             | Self-comparison `a !== a`   | Line 20      | Only value where `x !== x`   |
| **null/undefined**  | Strict equality             | Line 16      | Handled in non-object check  |
| **Date**            | `getTime()` comparison      | Line 30-31   | Timestamp equality           |
| **RegExp**          | Source + flags comparison   | Line 34-35   | Pattern and modifiers        |
| **Set**             | Size + membership check     | Line 38-49   | No deep comparison of values |
| **Map**             | Size + recursive key/value  | Line 95-106  | Deep comparison of values    |
| **ArrayBuffer**     | Convert to DataView         | Line 52-55   | Byte-level comparison        |
| **TypedArray**      | Convert to DataView         | Line 57-72   | All typed arrays handled     |
| **Array**           | Length + recursive elements | Line 81-92   | Standard array comparison    |
| **Plain Object**    | Keys + recursive values     | Line 119-128 | Standard object comparison   |
| **Custom valueOf**  | Call `valueOf()`            | Line 111-112 | Fallback for special objects |
| **Custom toString** | Call `toString()`           | Line 115-116 | Final fallback               |

---

## Performance Considerations

### Deliberate Trade-offs

1. **Circular Reference Detection Overhead**
   - WeakMap created for EVERY call
   - WeakMap lookups for EVERY object
   - **Cost**: ~10-30% slower than libraries without circular support
   - **Benefit**: No need for separate `isEqualCircular()` API

2. **Prototype Checking**
   - `Object.getPrototypeOf()` called for every object pair
   - **Cost**: Small overhead per comparison
   - **Benefit**: Correctly distinguishes type mismatches early

3. **Recursive Algorithm**
   - Stack depth proportional to object nesting
   - **Limitation**: Deep nesting (>1000 levels) may cause stack overflow
   - **Mitigation**: Real-world objects rarely exceed this limit

### Optimization Techniques Used

1. **Early Returns**: Strict equality check first (line 11)
2. **Size Checks**: Length/size comparison before iteration (arrays, sets, maps)
3. **Reverse Iteration**: `for (let i = length; i-- !== 0;)` - slightly faster
4. **Inline valueOf/toString**: Uses cached prototype methods (line 1)
5. **Type-Specific Paths**: Avoids generic iteration for known types

### Benchmark Context

The repository includes benchmarks comparing against:

- `deep-equal` (comprehensive but slower)
- `fast-deep-equal` (fast but may miss edge cases)
- `dequal` (fast but limited type support)
- `react-fast-compare` (optimized for React element comparison)

Run benchmarks: `yarn benchmark`

---

## Testing Strategy

### Test Organization (`src/is-equal.test.ts`)

1. **Suite-Based Testing**: Uses `testCases` from `src/fixtures/tests.ts`
2. **Bidirectional Testing**: Every test runs with both `(a, b)` and `(b, a)` (line 18-20)
3. **Special Case Tests**: Explicit tests for edge cases (NaN, null-prototype, circular refs)

### Test Fixture Structure (`src/fixtures/tests.ts`)

```typescript
export type TestCase = {
	name: string; // Descriptive test name
	value1: any; // First value to compare
	value2: any; // Second value to compare
	equal: boolean; // Expected result
	skip?: boolean; // Optional skip flag
};

export type TestSuite = {
	name: string; // Category name (e.g., "scalars", "objects")
	tests: TestCase[];
};
```

### Test Categories

Review `src/fixtures/tests.ts` for complete test suites covering:

- Scalars (numbers, strings, booleans, null, undefined, NaN)
- Objects (plain, nested, with null prototype)
- Arrays (empty, nested, sparse)
- Sets and Maps (simple, nested, custom classes)
- Dates and RegExps
- TypedArrays and ArrayBuffers
- Functions (always unequal unless same reference)
- Circular references

### Adding New Tests

When adding support for a new type or fixing a bug:

1. Add test cases to appropriate suite in `src/fixtures/tests.ts`
2. Include both positive (equal) and negative (not equal) cases
3. Add edge cases (empty, null values, extreme sizes)
4. Run tests: `yarn test`
5. Check coverage: `yarn test:coverage`

---

## Development Workflow

### Available Commands

```bash
# Development
yarn lint              # Run ESLint
yarn lint:fix          # Auto-fix linting issues
yarn test              # Run tests
yarn test:coverage     # Run tests with coverage report
yarn benchmark         # Run performance benchmarks

# Building
yarn build             # Clean and compile TypeScript
yarn build:clean       # Remove dist directory

# Publishing (automated via semantic-release)
# Commits follow conventional commits format
# CI/CD handles versioning and publishing
```

### Code Quality Standards

1. **ESLint**: Uses `@ver0/eslint-config` (line 47, package.json)
2. **TypeScript**: Strict mode enabled
3. **Coverage**: Aim for >95% code coverage
4. **Conventional Commits**: Required for semantic versioning

### File Structure

```text
src/
├── is-equal.ts              # Main implementation (132
lines)
├── is-equal.test.ts         # Test suite (65 lines)
├── comparison.benchmark.ts  # Performance benchmarks
└── fixtures/
	 ├── tests.ts            # Test case definitions
	 └── benchmark.ts        # Benchmark fixtures
```

---

## Code Patterns & Conventions

### 1. Optimization Over Readability

The code prioritizes performance in hot paths:

```typescript
// Reverse iteration (slightly faster)
for (let i = a.length; i-- !== 0;) { ...
}

// Cached prototype methods
const {valueOf, toString} = Object.prototype;

// Early size checks before iteration
if (a.size !== b.size) return false;
```

### 2. Type-First Comparison Order

Types are compared in order of:

1. Most common ? least common (Arrays before Maps)
2. Cheapest ? most expensive (Date before Array)
3. Special handling ? generic handling (Set before plain object)

### 3. ESLint Overrides

Intentional lint rule violations are documented:

```typescript
// eslint-disable-next-line complexity
const inner = (a: any, b: any): boolean => {
// Complex function justified by single-function API
```

### 4. Variable Reuse

In TypedArray handling, variables are reassigned to avoid creating new bindings:

```typescript
if (constructor === ArrayBuffer) {
	a = new DataView(a); // Reuse 'a' and 'b' variables
	b = new DataView(b);
}
```

---

## Edge Cases & Special Handling

### 1. NaN Equality

**Problem**: `NaN !== NaN` in JavaScript **Solution**: Self-comparison check `a !== a && b !== b` **Test**:
`src/is-equal.test.ts:60-64`

### 2. Null-Prototype Objects

**Problem**: `Object.create(null)` has different prototype than `{}` **Solution**: Prototype comparison catches this
(line 24) **Test**: `src/is-equal.test.ts:43-58`

### 3. Circular References

**Problem**: `obj.self = obj` causes infinite recursion **Solution**: WeakMap tracks visited objects **Test**: README.md
example (lines 62-67)

### 4. Set Value Comparison

**Important**: Sets use reference equality (`has(value)`), not deep equality **Implication**:
`new Set([{a: 1}]) !== new Set([{a: 1}])` **Rationale**: Maintains O(n) performance, matches JavaScript Set behavior

### 5. Custom Objects with valueOf/toString

**Problem**: Some objects define custom value representations **Solution**: Fallback comparison using `valueOf()` then
`toString()` (lines 111-116) **Example**: Wrapper objects, custom value types

### 6. TypedArray Endianness

**Problem**: Different TypedArray types have different byte orders **Solution**: Convert all to DataView for consistent
byte-level comparison **Location**: `src/is-equal.ts:52-72`

---

## Extending the Library

### Adding Support for New Types

Follow this pattern when adding a new type (e.g., BigInt64Array, custom types):

1. **Add type check after prototype comparison**:

   ````typescript
   	if (constructor === YourType) {
   			// Your comparison logic
   			return /* boolean result */;
   	}
   	```

   ````

2. **Place before generic object comparison**: Type-specific handlers go before line 109

3. **Add test cases** to `src/fixtures/tests.ts`:

   ````typescript
   	{
   			name: 'YourType tests',
   			tests: [
   					{name: 'equal YourType instances', value1: ..., value2: ..., equal: true},
   					{name: 'unequal YourType instances', value1: ..., value2: ..., equal: false},
   			]
   	}
   	```

   ````

4. **Update README**: Add to "Supported Types" section (line 89-102)

5. **Add benchmark fixture** if performance-critical

### Common Extension Scenarios

#### Scenario 1: Add Deep Set Comparison

**Current**: Sets use `has()` (reference equality) **Change**: Deep compare Set values

```typescript
if (constructor === Set) {
	if (a.size !== b.size) return false;

	for (const aValue of a) {
		let found = false;
		for (const bValue of b) {
			if (inner(aValue, bValue)) {
				// Deep comparison
				found = true;
				break;
			}
		}
		if (!found) return false;
	}
	return true;
}
```

**Trade-off**: O(n?) complexity vs current O(n)

#### Scenario 2: Add URL Support

```typescript
if (constructor === URL) {
	return a.href === b.href;
}
```

Add after RegExp check (line 36).

#### Scenario 3: Add Custom Equality Method

Support objects with `equals()` method:

```typescript
// Add before valueOf check (line 111)
if (typeof a.equals === 'function' && typeof b.equals === 'function') {
	return a.equals(b);
}
```

---

## Common Issues & Solutions

### Issue: Stack Overflow on Deep Objects

**Symptom**: RangeError: Maximum call stack size exceeded **Cause**: Object nesting exceeds JavaScript stack limit
(~1000 levels) **Solution**: Extremely rare in real-world data. If needed, refactor to iterative approach with manual
stack.

### Issue: WeakMap Memory Overhead

**Symptom**: Perceived memory usage in tight loops **Cause**: WeakMap created per `isEqual()` call **Solution**: This is
intentional. WeakMap is GC'd after comparison. If performance-critical, consider caching strategy in caller.

### Issue: False Negatives with Custom Classes

**Symptom**: Two instances with same data return false **Cause**: Custom class instances without
`valueOf()`/`toString()` **Solution**: Implement `valueOf()` or `toString()` in custom class, or destructure before
comparison.

### Issue: Performance Degradation on Large Arrays

**Symptom**: Slow comparison for arrays with 10,000+ elements **Cause**: O(n) recursive comparison **Solution**:
Expected behavior. Consider domain-specific optimizations (e.g., sorted array diffing).

---

## Key Files Reference

| File                          | Purpose             | Lines | Key Exports           |
| ----------------------------- | ------------------- | ----- | --------------------- |
| `src/is-equal.ts`             | Main implementation | 132   | `isEqual()`           |
| `src/is-equal.test.ts`        | Test suite          | 65    | Test cases            |
| `src/fixtures/tests.ts`       | Test definitions    | ~500  | `testCases`           |
| `src/fixtures/benchmark.ts`   | Benchmark data      | ~200  | `simple`, `complex`   |
| `src/comparison.benchmark.ts` | Benchmark runner    | 44    | Vitest benchmarks     |
| `package.json`                | Project config      | 61    | Scripts, dependencies |
| `tsconfig.json`               | TS config (dev)     | -     | Strict mode enabled   |
| `tsconfig.build.json`         | TS config (build)   | -     | Production settings   |
| `eslint.config.js`            | Lint config         | -     | ESLint rules          |

---

## Debugging Tips

### Enable Detailed Logging

Add temporary logging to inner function:

```typescript
const inner = (a: any, b: any, depth = 0): boolean => {
	console.log('  '.repeat(depth), {a, b, type: a?.constructor?.name});
	// ... rest of function
};
```

### Identify Comparison Failure Point

Wrap recursive calls:

```typescript
if (!inner(a[key], b[key])) {
	console.log('Failed at key:', key, a[key], b[key]);
	return false;
}
```

### Test Isolated Types

Create minimal test cases:

```typescript
it('debug case', () => {
	const a = /* your problematic value */;
	const b = /* your problematic value */;
	expect(isEqual(a, b)).toBe(true);
});
```

---

## Performance Profiling

### Using Vitest Benchmark

```bash
yarn benchmark
```

Results show ops/sec for each library. Focus on:

- **Simple benchmarks**: Primitives, shallow objects
- **Complex benchmarks**: Deep nesting, circular refs, TypedArrays

### Custom Profiling

```typescript
import {isEqual} from '@ver0/deep-equal';

console.time('comparison');
for (let i = 0; i < 100000; i++) {
	isEqual(yourObjectA, yourObjectB);
}
console.timeEnd('comparison');
```

### Profiling in Chrome DevTools

1. Run benchmark in browser context
2. Open DevTools ? Performance tab
3. Record during benchmark execution
4. Analyze flame graph for hotspots

---

## Contributing Guidelines

When modifying the codebase:

1. **Maintain API Stability**: `isEqual(a, b)` signature is public contract
2. **Preserve Edge Case Handling**: Don't break existing test cases
3. **Document Trade-offs**: Explain performance vs correctness decisions
4. **Add Comprehensive Tests**: Cover both positive and negative cases
5. **Run Full Test Suite**: `yarn test && yarn lint && yarn benchmark`
6. **Update Documentation**: Modify README.md and this AGENTS.md
7. **Follow Conventional Commits**: Use semantic commit messages

### Commit Message Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, perf, refactor, test, chore

**Example**:

```text
feat(set): add deep comparison for Set values

Implements O(n?) deep comparison for Set elements instead of
reference equality. Adds configuration option to enable/disable.

BREAKING CHANGE: Set comparison behavior changed for objects
```

---

## Additional Resources

- **Codebase**: https://github.com/ver0-project/deep-equal
- **NPM Package**: https://www.npmjs.com/package/@ver0/deep-equal
- **Issue Tracker**: https://github.com/ver0-project/deep-equal/issues
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)
- **Semantic Release**: Automated versioning (`.releaserc.json`)

---

## Quick Reference: Core Decisions

| Decision                  | Rationale                    | Trade-off                            |
| ------------------------- | ---------------------------- | ------------------------------------ |
| WeakMap for circular refs | Prevents infinite recursion  | ~20% performance overhead            |
| Self-comparison for NaN   | Faster than `Number.isNaN()` | Less readable                        |
| Prototype checking        | Correct type distinction     | Extra function call                  |
| Single API function       | Simple API surface           | Can't optimize for non-circular case |
| Reverse iteration         | Micro-optimization           | Less conventional                    |
| Set reference equality    | O(n) performance             | No deep Set comparison               |
| DataView for TypedArrays  | Universal byte comparison    | Conversion overhead                  |

---

**Last Updated**: 2025-11-09 **Version**: Based on codebase snapshot at commit d8da2fb
