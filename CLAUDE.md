# Claude Instructions

## Code style

- Don't use enums.
- DO NOT USE COMMENTS UNLESS EXPLICITLY ASKED.
- DO NOT REMOVE EXISTING COMMENTS.
- Default to interfaces for object signatures.
- Use `function` declaration for top-level functions and React components.
- Use arrow functions for callbacks.
- Use object method shorthand syntax in objects and interfaces.
  constants.ts files.
- Avoid nested ternary expressions; prefer clear branching or functional expressions.
- Prefer `const` where possible; avoid `let` when it improves clarity.
- Prefer constants over magic numbers or strings.

### Styling with Panda CSS

Use CSS style props directly on components instead of the `style` object notation:

```tsx
// ✅ Preferred: CSS style props
<Box position="absolute" top={0} left={0} bg="ink.background-primary" p="space.04" />

// ❌ Avoid: object notation via style prop
<Box style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'red', padding: '16px' }} />
```

Only use `style={{ }}` when absolutely necessary (e.g., dynamic values that can't be expressed as tokens, or third-party components that don't support Panda props).

For responsive styles, use array notation instead of object notation:

```tsx
// ✅ Preferred: array notation for responsive values
<Box width={['100%', '50%', '33%']} p={['space.02', 'space.04']} />

// ❌ Avoid: object notation with breakpoint keys
<Box width={{ base: '100%', md: '50%', lg: '33%' }} p={{ base: 'space.02', md: 'space.04' }} />
```

Array values map to breakpoints in order: `[base, sm, md, lg, xl, 2xl]`. Use `null` to skip a breakpoint.

## Naming

- use camelCase for file-level constants, screaming snake case in the "constants" package or constants.ts files.
- Use descriptive, elaborate, intention-revealing names that explain what the function does, not how.
- Booleans start with is/has/should/can.

## Never use exceptions for control flow

- Do not throw errors in helpers, utility functions, or any part of normal control paths (e.g., React lifecycle, async setup, reducers, render logic).
- Exceptions are for truly unexpected, unrecoverable failures—not for branching or expected conditions.
- Use explicit return values like null, undefined, or well-typed status objects to represent expected failure or alternative paths.

## Decompose impure logic

- Avoid mixing unrelated concerns (e.g., state access, conditional logic, async side effects, configuration).
- Separate pure computation from impure operations (e.g., store reads/writes, I/O, global mutations).
- Factor out non-trivial meaningful logic into named functions, even if only used once.
- Prefer composable functions with clear input/output boundaries.

## Typescript

- Do not use type casting through `as` or non-null assertions (!).
- If a cast is truly necessary, include a runtime check and/or a type guard.
- Do not use `any`; prefer `unknown` with further narrowing if a type cannot be immediately described.

## React component props

- Define component props in a separate interface above the component, in the format
  ComponentNameProps.
- Destructure props directly in the signature: `function Component({ propA, propB }: ComponentProps)`

## File naming

- Use snake case file names
- File names must explain their contents, e.g., a file containing `AlternateHeaderLayout`
  is called `alternate-header-layout.tsx`
- Avoid using index.ts(x) files, except for the following scenarios:
  - Barrel exports from library packages
  - Required by file-based router
- use \*.spec.ts(x) for tests

## Use Remeda for functional utilities

Prefer [Remeda](https://remedajs.com) when working with non-trivial data transformations that benefit from strong typing, immutability, and composability.

### Typed object utilities

Use `keys`, `entries`, and `fromEntries` instead of `Object.keys`, `Object.entries`, and `Object.fromEntries`. Remeda retains exact key types, including literal unions.

```ts
import { keys } from 'remeda';

const obj = { foo: 1, bar: 2 };
const result = keys(obj); // type: ('foo' | 'bar')[]
```

### Chained transformations

```ts
import { filter, groupBy, mapValues, pipe } from 'remeda';

const users = [
  { id: 1, role: 'admin', isActive: true },
  { id: 2, role: 'user', isActive: true },
  { id: 3, role: 'admin', isActive: false },
];

const counts = pipe(
  users,
  filter(u => u.isActive),
  groupBy(u => u.role),
  mapValues(list => list.length)
);
// type: { admin: number; user: number }
```

### When not to use Remeda

Use native JS methods for trivial operations where type inference is already correct and readability is higher:

```ts
const ids = items.map(x => x.id);
```

## Commit conventions

- Use conventional commits format.
- Use scope to specify affected areas, .e.g., feat(mobile), refactor(web), fix(utils).
- Use imperative language.
- Do not add anything to the commit message body unless explicitly asked.

## Tooling

### Package Management

- Our repo is a turbo monorepo which uses `pnpm` for package management and package.json scripts.
- Many common actions can be found in respective pacakge and apps `scripts` in the package.json.

### Verify before completing

Verify that no formatting, type, or lint errors are introduced:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
```

If `format:check` fails, run `pnpm format` to auto-fix formatting issues.

For faster feedback when working in a specific package, use filtered commands:

```bash
pnpm --filter @leather.io/web lint
pnpm --filter @leather.io/extension typecheck
```

Fix any errors before considering the task complete.

### Prettier formatting

Follow the project's Prettier configuration. Key rules:
- Use single quotes for strings
- Use trailing commas where valid in ES5 (objects, arrays)
- 2-space indentation
- 100 character print width
- Avoid parentheses around single arrow function parameters: `x => x` not `(x) => x`
- Imports are auto-sorted: React first, then third-party, then `@leather.io/*`, then relative
