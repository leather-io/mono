---
description: Review PR changes against Leather code standards
allowed-tools: Bash(git:*), Read, Grep
---

# PR Review

Review the current branch changes against main, checking for Leather project standards.

## Get Changes

```bash
git diff origin/main...HEAD --stat
```

```bash
git diff origin/main...HEAD
```

## Checklist

Review each changed file against these project rules:

### TypeScript Rules
- [ ] No `enum` declarations (use const objects or union types)
- [ ] No `as` type casting (use type guards or proper typing)
- [ ] No `!` non-null assertions (handle null cases explicitly)
- [ ] No `any` type (use `unknown` with narrowing)
- [ ] Interfaces preferred over type aliases for object shapes

### Code Style
- [ ] `function` declaration for top-level functions and React components
- [ ] Arrow functions for callbacks only
- [ ] No nested ternary expressions
- [ ] `const` over `let` where possible
- [ ] Constants over magic numbers/strings

### Naming
- [ ] camelCase for variables and functions
- [ ] Boolean names start with is/has/should/can
- [ ] Descriptive, intention-revealing names
- [ ] Snake-case file names (`bitcoin-address.ts`)

### Comments
- [ ] No new comments added (unless explicitly requested)
- [ ] Existing comments preserved

### Error Handling
- [ ] No exceptions for control flow
- [ ] Return null/undefined or status objects for expected failures
- [ ] Exceptions only for truly unexpected failures

### Functional Patterns
- [ ] Pure computation separated from side effects
- [ ] Remeda used for non-trivial data transformations
- [ ] Composable functions with clear input/output

### Testing
- [ ] Tests added/updated for new functionality
- [ ] Test files use `*.spec.ts` naming
- [ ] Tests co-located with source

## Output Format

Provide feedback in this structure:

### Summary
Brief overview of changes and overall assessment.

### Issues Found
List any violations of project rules with file:line references.

### Suggestions
Optional improvements that aren't rule violations.

### Verdict
✅ **Ready to merge** - No issues found
⚠️ **Needs changes** - Issues listed above must be addressed
❓ **Needs discussion** - Architectural questions to resolve
