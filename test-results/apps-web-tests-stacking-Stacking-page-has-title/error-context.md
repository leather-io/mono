# Test info

- Name: Stacking page >> has title
- Location: /Users/markmhendrickson/www/mono/apps/web/tests/stacking.spec.ts:6:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

    at /Users/markmhendrickson/www/mono/apps/web/tests/stacking.spec.ts:7:16
```

# Test source

```ts
   1 | import { expect } from '@playwright/test';
   2 |
   3 | import { test } from '.';
   4 |
   5 | test.describe('Stacking page', () => {
   6 |   test('has title', async ({ page }) => {
>  7 |     await page.goto('/');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
   8 |     await expect(page.getByRole('heading', { name: 'Stacking', level: 1 })).toBeVisible();
   9 |   });
  10 | });
  11 |
```