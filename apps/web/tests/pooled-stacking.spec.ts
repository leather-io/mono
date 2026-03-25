import { test } from './index';

test.describe('Pooled Stacking', () => {
  test('users can perform Fastpool v2 stacking', async ({ page, mode }) => {
    await mode({ mode: 'mock-connected' });
    await page.getByTestId('start-earning-button-fast-pool-v2').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.locator('#amount').click();
    await page.locator('#amount').fill('500');
    await page.getByRole('button', { name: 'Allow' }).click();
    await page.getByRole('button', { name: 'Resolve' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'Resolve' }).click();
    await test.expect(page.getByText('Pooled Stacking')).toBeVisible();
    await test.expect(page.getByText('Fast Pool v2').first()).toBeVisible();
    await test.expect(page.getByRole('button', { name: 'Stop pooling' })).toBeVisible();
    await test.expect(page.getByRole('button', { name: 'Increase pooling amount' })).toBeVisible();
  });
});
