# @ver0/deep-equal

Deep equality comparison library. Correctness and comprehensive type support over raw performance.
Single export: `isEqual(a, b)`.

## Commands

| Command | Description |
|---------|-------------|
| `yarn test` | Run tests (vitest) |
| `yarn test:coverage` | Tests with coverage report |
| `yarn lint` | ESLint |
| `yarn lint:fix` | ESLint auto-fix |
| `yarn build` | Clean + compile TypeScript |
| `yarn benchmark` | Run vitest benchmarks |

## Architecture

```text
src/
  is-equal.ts              # Entire implementation (~132 lines, single exported function)
  is-equal.test.ts         # Test runner — iterates fixture suites + edge case tests
  comparison.benchmark.ts  # Vitest benchmarks vs other libraries
  fixtures/
    tests.ts               # Test case definitions (TestSuite[] with TestCase[])
    benchmark.ts            # Benchmark fixtures
```

Single-file library. All comparison logic lives in `src/is-equal.ts` as one recursive closure.

## Code Conventions

- **Yarn 4** — `yarn@4.10.2`, node-modules linker
- **TypeScript strict mode** — ESNext target, NodeNext modules
- **ESM only** — `"type": "module"`, `.js` extensions in imports
- **`@ver0/eslint-config`** — all `@typescript-eslint/no-unsafe-*` rules disabled (intentional, the core function uses `any`)
- **Conventional commits** — `feat`, `fix`, `perf`, `refactor`, `test`, `chore`, `docs`
- **Semantic release** — automated versioning, do not manually bump versions

## Implementation Patterns

- **Reverse iteration** in hot loops: `for (let i = length; i-- !== 0;)`
- **Self-comparison for NaN**: `a !== a && b !== b` (faster than `Number.isNaN`)
- **Prototype-based type checking**: `Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)` before constructor checks
- **Variable reuse**: TypedArray handling reassigns `a`/`b` to DataView — intentional, not a bug
- **Cached prototype methods**: `const {valueOf, toString} = Object.prototype` at module scope
- **eslint-disable comments** are intentional — `complexity` on the inner function, `no-self-compare` on NaN check

## Testing

- **Fixture-driven**: Tests defined as `TestSuite[]` in `src/fixtures/tests.ts`, iterated by the test runner
- **Bidirectional**: Every test case runs with both `(a, b)` and `(b, a)` argument order
- **Adding tests**: Add `TestCase` entries to the appropriate suite in `src/fixtures/tests.ts` — include both equal and not-equal cases
- **Edge cases**: Standalone `it()` blocks in `is-equal.test.ts` for circular refs, null-prototype, NaN

## Gotchas

- **Sets use reference equality** — `new Set([{a:1}])` vs `new Set([{a:1}])` returns `false`. This is intentional (O(n) vs O(n²))
- **WeakMap per call** — created on every `isEqual()` invocation for circular reference tracking. Overhead is a deliberate trade-off for single-API simplicity
- **Stack depth** — recursive algorithm, deep nesting (>1000 levels) may cause stack overflow. Not mitigated; rare in practice
- **Custom classes** — compared via `valueOf()` then `toString()` fallback. Classes without these return false for different instances with same data
- **TypedArray byte comparison** — all TypedArrays converted to DataView. Handles endianness but adds conversion overhead
