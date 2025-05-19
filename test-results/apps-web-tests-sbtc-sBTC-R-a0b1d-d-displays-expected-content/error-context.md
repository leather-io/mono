# Test info

- Name: sBTC Rewards page >> loads correctly and displays expected content
- Location: /Users/markmhendrickson/www/mono/apps/web/tests/sbtc.spec.ts:6:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/sbtc", waiting until "load"

    at /Users/markmhendrickson/www/mono/apps/web/tests/sbtc.spec.ts:8:16
```

# Test source

```ts
   1 | import { expect } from '@playwright/test';
   2 |
   3 | import { test } from '.';
   4 |
   5 | test.describe('sBTC Rewards page', () => {
   6 |   test('loads correctly and displays expected content', async ({ page }) => {
   7 |     // Navigate to the sBTC Rewards page
>  8 |     await page.goto('/sbtc');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
   9 |
  10 |     await expect(page.getByRole('heading', { name: 'sBTC Rewards', level: 1 })).toBeVisible();
  11 |
  12 |     await expect(
  13 |       page.getByRole('heading', { name: 'Earn yield with bitcoin on stacks', level: 2 })
  14 |     ).toBeVisible();
  15 |
  16 |     await expect(page.getByText(/Get BTC in the form of sBTC on Stacks/)).toBeVisible();
  17 |
  18 |     await expect(page.getByRole('heading', { name: 'Step 1: Get sBTC', level: 3 })).toBeVisible();
  19 |
  20 |     await expect(
  21 |       page.getByRole('heading', { name: 'Step 2: Choose reward protocol', level: 3 })
  22 |     ).toBeVisible();
  23 |
  24 |     await expect(page.getByRole('heading', { name: 'Basic sBTC rewards', level: 3 })).toBeVisible();
  25 |   });
  26 | });
  27 |
```