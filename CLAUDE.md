# @ver0/deep-equal

Deep equality comparison library. Correctness and comprehensive type support over raw performance. Single export:
`isEqual(a, b)`.

## Commands

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `yarn test`          | Run tests (vitest through `vp`) |
| `yarn test:coverage` | Tests with coverage report      |
| `yarn lint`          | Oxlint                          |
| `yarn lint:fix`      | Oxlint auto-fix                 |
| `yarn fmt`           | Format with oxfmt               |
| `yarn fmt:check`     | Check formatting                |
| `yarn typecheck`     | Type check without emitting     |
| `yarn build`         | Bundle with `vp pack` (tsdown)  |
| `yarn benchmark`     | Run vitest benchmarks           |

## Architecture

```text
vite.config.ts             # Vite+ config — test, pack, lint and fmt in one place
src/
  is-equal.ts              # Entire implementation (~230 lines, single exported function)
  is-equal.test.ts         # Test runner — iterates fixture suites + edge case tests
  comparison.benchmark.ts  # Vitest benchmarks vs other libraries
  fixtures/
    tests.ts               # Test case definitions (TestSuite[] with TestCase[])
    benchmark.ts            # Benchmark fixtures
```

Single-file library. All comparison logic lives in `src/is-equal.ts` as one module-level recursive function, `inner`,
with three helpers: `builtinOf` for the built-in class a subclass instance extends, `rootOf` for the union-find lookup
and `drain` for the pairs deferred at `DEPTH_LIMIT`.

## Code Conventions

- **Yarn 4** — `yarn@4.17.1`, node-modules linker
- **TypeScript 7** — native compiler, type check only (`noEmit`), ESNext target, NodeNext modules
- **Strict beyond `strict`** — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`,
  `erasableSyntaxOnly`
- **Build** — `vp pack` bundles `src/is-equal.ts` into `dist/is-equal.js` and `dist/is-equal.d.ts`. The oxc generator
  emits the declaration, so each export carries an explicit type. The syntax target of the output follows
  `engines.node`. publint and attw check the manifest against the output
- **ESM only** — `"type": "module"`, `.js` extensions in imports
- **Vite+ toolchain** — `vp` drives vitest, tsdown, oxlint and oxfmt; everything is configured in `vite.config.ts`
- **`vite-plus/test`** — test and benchmark files import the test API from it. The package depends on neither `vitest`
  nor `oxlint`; `vite-plus` bundles both
- **`@ver0/oxlint-config`** — `javascript`, `typescript` + `typescriptUnsafe`, `node` and `vitest` presets. The unsafe
  preset disables the `no-unsafe-*` family (intentional, the core function uses `any`)
- **Conventional commits** — `feat`, `fix`, `perf`, `refactor`, `test`, `chore`, `docs`
- **Semantic release** — automated versioning, do not manually bump versions

## Implementation Patterns

- **Reverse iteration** in hot loops: `for (let i = length; i-- !== 0;)`
- **Self-comparison for NaN**: `a !== a && b !== b` (faster than `Number.isNaN`)
- **Prototype-based type checking**: `Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)` before constructor checks
- **Variable reuse**: parameters `a`/`b` may be reassigned locally — intentional, not a bug
- **Cached prototype methods**: `const {valueOf, toString} = Object.prototype` at module scope
- **oxlint-disable comments** are intentional — `typescript/unbound-method` on the prototype method cache,
  `typescript/no-restricted-types` on the `Visited` type, `no-self-compare` on the NaN checks,
  `unicorn/no-instanceof-array` and `unicorn/no-instanceof-builtins` on `builtinOf`'s `Array` check

## Testing

- **Fixture-driven**: Tests defined as `TestSuite[]` in `src/fixtures/tests.ts`, iterated by the test runner
- **Bidirectional**: Every test case runs with both `(a, b)` and `(b, a)` argument order
- **Adding tests**: Add `TestCase` entries to the appropriate suite in `src/fixtures/tests.ts` — include both equal and
  not-equal cases
- **Edge cases**: Standalone `it()` blocks in `is-equal.test.ts` for circular refs, null-prototype, NaN

## Gotchas

- **Sets use reference equality** — `new Set([{a:1}])` vs `new Set([{a:1}])` returns `false`. Intentional — respects the
  Set's own SameValueZero identity model rather than overriding it with deep comparison
- **Lazy visited map** — created only when recursion into objects/arrays/maps occurs. Primitives, Date, RegExp, Set, and
  TypedArray comparisons never allocate it. It is a strong `Map`, not a `WeakMap`: the `WeakMap` measured 5 to 12%
  slower on nested values (Node 26.13.1, not measured on other engines). The `Map` keeps every object it records alive
  until the call returns, including objects that a getter created for the comparison
- **Cycles compare by unfolded value** — two circular structures are equal when they unfold to the same value, even with
  cycle lengths that differ. Node's `util.isDeepStrictEqual` returns `false` for such pairs. The visited map maps each
  object to the first object it was compared with. An object met with a second partner makes the two partners equal to
  each other: their classes merge in the union-find `Map` at `visited.classes`, and a pair whose partners already share
  a class counts as equal and is not compared again. Two rings of coprime lengths `n` and `m` visit about `n + m` pairs,
  not `n * m`. A getter whose value changes between reads can therefore see fewer reads than one per pair
- **Stack depth** — `inner` recurses at most `DEPTH_LIMIT` pairs deep. A pair met at the limit waits in
  `visited.deferred`, and the outermost frame (`depth` 0) compares the waiting pairs in order. Nesting depth and cycle
  length never reach the call stack, but a caller that has used most of the stack can still overflow. A waiting pair is
  compared after its shallower siblings, so user code in those siblings (getters, Proxy traps, custom
  `valueOf`/`toString`) can run, and throw, where plain recursion would already have returned `false` at a deeper
  difference. A value that keeps producing new objects without end (a getter returning a new object on every read) runs
  until the heap runs out: nothing bounds the total work, and `visited.deferred` keeps every deferred pair until the
  comparison ends
- **Symbol-keyed properties ignored** — symbols are designed as non-enumerable hidden identifiers for metadata
  (well-known symbols, `$$typeof`), not data-carrying properties. Comparing them as data would contradict their intended
  role
- **Custom classes** — compared via `valueOf()` then `toString()` fallback, only when both instances share the same
  function reference. Classes without these return false for different instances with same data
- **TypedArray byte comparison** — all TypedArrays and DataViews compared via Uint8Array over their
  `byteOffset`/`byteLength` slice. Byte-level comparison preserves NaN bit patterns
- **Built-in subclasses** — the switches in `inner` match `constructor` by identity, so a `Map`, `Set`, `Array`,
  `ArrayBuffer` or `SharedArrayBuffer` subclass instance misses every case. The first switch's `default` finds the
  built-in with `builtinOf` and calls `inner` again with it as `builtin`. `builtinOf` uses `instanceof`, because
  `Object.getPrototypeOf` measured several times slower there. Exact `Object`, `Array` and `Map` instances also reach
  that `default` and skip the lookup. `Date`, `RegExp`, TypedArray and `DataView` subclasses stay off this path: they
  already compare through `valueOf`, `toString` and `ArrayBuffer.isView`, and routing an invalid `Date` subclass
  instance to `getTime` changes its answer

<git-commit-config>
<extra-instructions>
This project uses semantic-release with Angular preset (Conventional Commits).
Commit messages directly control automated versioning:

- `fix:` → patch release
- `feat:` → minor release
- `BREAKING CHANGE:` footer → major release

Breaking changes MUST use `BREAKING CHANGE:` (two words, uppercase) as a git trailer in the commit footer.
`BREAKING-CHANGE:` is also accepted.

Do NOT use `BREAKING:` alone or `!` in the subject — the Angular preset does not detect these and the major version bump
will be silently skipped. </extra-instructions> </git-commit-config>
