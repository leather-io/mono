---
name: testing-patterns
description: Testing conventions and patterns for the Leather monorepo. Use when writing tests, creating test fixtures, or following TDD workflow. Covers Vitest setup, naming conventions, and common patterns.
---

# Leather Testing Patterns

The monorepo uses **Vitest** for testing. Tests are co-located with source files.

## File Naming

- Test files: `{module-name}.spec.ts` or `{module-name}.spec.tsx`
- Co-located with source: `src/utils/format.ts` → `src/utils/format.spec.ts`

## Test Structure

```typescript
import { functionUnderTest } from './module-name';

describe(functionUnderTest.name, () => {
  test('describes expected behavior', () => {
    // Arrange
    const input = createTestData();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toEqual(expected);
  });

  test('handles error case', () => {
    expect(() => functionUnderTest(invalidInput)).toThrowError();
  });
});
```

## Key Conventions

1. **Use `test` not `it`** - Project convention
2. **Name describe blocks with function reference**: `describe(functionName.name, () => {})`
3. **Descriptive test names**: Describe behavior, not implementation
4. **Test both success and error paths**

## Fixtures and Test Data

Define reusable test data at file scope:

```typescript
import BigNumber from 'bignumber.js';
import { createMoney } from './create-money';

const tenStx = createMoney(10, 'STX', 6);
const tenBtc = createMoney(10, 'BTC', 8);
const moneyArray = [tenStx, eightStx, nineStx];
```

## BigNumber Assertions

For Money and BigNumber comparisons:

```typescript
expect(result.amount.toString()).toEqual('100');
// NOT: expect(result.amount).toEqual(new BigNumber(100));
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @leather.io/utils test

# Run tests in watch mode
pnpm --filter @leather.io/bitcoin test -- --watch

# Run specific test file
pnpm --filter @leather.io/utils test -- src/money/create-money.spec.ts
```

## Mocking

For pure utility functions, avoid mocking internal modules. Mock only:
- External API calls
- Browser/native APIs
- Time-dependent functions

```typescript
import { vi } from 'vitest';

vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-15'));
```

## React Component Tests

For UI components in `@leather.io/ui`:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  test('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Common Patterns

### Testing thrown errors
```typescript
test('throws on invalid input', () => {
  expect(() => functionUnderTest(null)).toThrowError('Expected error message');
});
```

### Testing async functions
```typescript
test('resolves with data', async () => {
  const result = await asyncFunction();
  expect(result).toEqual(expected);
});
```

### Testing type guards
```typescript
test('returns true for valid input', () => {
  expect(isValidType(validInput)).toBe(true);
});

test('returns false for invalid input', () => {
  expect(isValidType(invalidInput)).toBe(false);
});
```
