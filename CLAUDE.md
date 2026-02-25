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
  is-equal.ts              # Entire implementation (~157 lines, single exported function)
  is-equal.test.ts         # Test runner — iterates fixture suites + edge case tests
  comparison.benchmark.ts  # Vitest benchmarks vs other libraries
  fixtures/
    tests.ts               # Test case definitions (TestSuite[] with TestCase[])
    benchmark.ts            # Benchmark fixtures
```

Single-file library. All comparison logic lives in `src/is-equal.ts` as one module-level recursive function.

## Code Conventions

- **Yarn 4** — `yarn@4.12.0`, node-modules linker
- **TypeScript strict mode** — ESNext target, NodeNext modules
- **ESM only** — `"type": "module"`, `.js` extensions in imports
- **`@ver0/eslint-config`** — all `@typescript-eslint/no-unsafe-*` rules disabled (intentional, the core function uses `any`)
- **Conventional commits** — `feat`, `fix`, `perf`, `refactor`, `test`, `chore`, `docs`
- **Semantic release** — automated versioning, do not manually bump versions

## Implementation Patterns

- **Reverse iteration** in hot loops: `for (let i = length; i-- !== 0;)`
- **Self-comparison for NaN**: `a !== a && b !== b` (faster than `Number.isNaN`)
- **Prototype-based type checking**: `Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)` before constructor checks
- **Variable reuse**: parameters `a`/`b` may be reassigned locally — intentional, not a bug
- **Cached prototype methods**: `const {valueOf, toString} = Object.prototype` at module scope
- **eslint-disable comments** are intentional — `complexity` on the inner function, `no-self-compare` on NaN check

## Testing

- **Fixture-driven**: Tests defined as `TestSuite[]` in `src/fixtures/tests.ts`, iterated by the test runner
- **Bidirectional**: Every test case runs with both `(a, b)` and `(b, a)` argument order
- **Adding tests**: Add `TestCase` entries to the appropriate suite in `src/fixtures/tests.ts` — include both equal and not-equal cases
- **Edge cases**: Standalone `it()` blocks in `is-equal.test.ts` for circular refs, null-prototype, NaN

## Gotchas

- **Sets use reference equality** — `new Set([{a:1}])` vs `new Set([{a:1}])` returns `false`. Intentional — respects the Set's own SameValueZero identity model rather than overriding it with deep comparison
- **Lazy WeakMap** — created only when recursion into objects/arrays/maps occurs. Primitives, Date, RegExp, Set, and TypedArray comparisons never allocate it
- **Stack depth** — recursive algorithm, deep nesting (>1000 levels) may cause stack overflow. Not mitigated; rare in practice
- **Symbol-keyed properties ignored** — symbols are designed as non-enumerable hidden identifiers for metadata (well-known symbols, `$$typeof`), not data-carrying properties. Comparing them as data would contradict their intended role
- **Custom classes** — compared via `valueOf()` then `toString()` fallback, only when both instances share the same function reference. Classes without these return false for different instances with same data
- **TypedArray byte comparison** — all TypedArrays and DataViews compared via Uint8Array over their `byteOffset`/`byteLength` slice. Byte-level comparison preserves NaN bit patterns

<git-commit-config>
<extra-instructions>
This project uses semantic-release with Angular preset (Conventional Commits).
Commit messages directly control automated versioning:

- `fix:` → patch release
- `feat:` → minor release
- `BREAKING CHANGE:` footer → major release

Breaking changes MUST use `BREAKING CHANGE:` (two words, uppercase) as a git
trailer in the commit footer. `BREAKING-CHANGE:` is also accepted.

Do NOT use `BREAKING:` alone or `!` in the subject — the Angular preset does
not detect these and the major version bump will be silently skipped.
</extra-instructions>
</git-commit-config>
