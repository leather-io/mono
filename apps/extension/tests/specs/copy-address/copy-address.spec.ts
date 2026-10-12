import { type Page, expect } from '@playwright/test';
import { CopyAddressMenuBtn } from '@tests/selectors/home.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { test } from '../../fixtures/fixtures';

async function dismissFeatureIntroducerIfVisible(page: Page) {
  const closeButton = page.getByTestId(SharedComponentsSelectors.FeatureIntroducerCloseBtn);
  const introducerAppeared = await closeButton
    .waitFor({ state: 'visible', timeout: 2000 })
    .then(() => true)
    .catch(() => false);
  if (introducerAppeared) await closeButton.click();
}

test.describe('Copy address menu', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('copies a labelled address from the current account context', async ({
    extensionId,
    page,
  }) => {
    await page.setViewportSize({ height: 600, width: 390 });
    await page.goto(`chrome-extension://${extensionId}/action-popup.html`);
    await dismissFeatureIntroducerIfVisible(page);
    await page.getByTestId(CopyAddressMenuBtn).click();

    const menuTitle = page.getByTestId('copy-address-menu-title');
    await expect(menuTitle).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Copy Bitcoin Native SegWit address' })
    ).toBeVisible();
    await expect(page.getByText('Default', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Native SegWit', { exact: true })).toBeVisible();
    await expect(page.getByText('Taproot', { exact: true })).toBeVisible();
    await expect(
      page.getByTestId('copy-address-stx').getByText('STX', { exact: true })
    ).toHaveCount(0);

    const nativeSegwitAddress = page.getByTestId('copy-address-btc-native-segwit-address');
    const nativeSegwitMenuItem = page.getByTestId('copy-address-btc-native-segwit');
    const nativeSegwitTitle = nativeSegwitMenuItem.getByText('Bitcoin', { exact: true });
    const nativeSegwitBadge = nativeSegwitMenuItem.getByText('Native SegWit', { exact: true });
    await expect(nativeSegwitAddress).toBeVisible();
    await expect(nativeSegwitAddress).toHaveText(/^bc1q/);
    await expect
      .poll(() => nativeSegwitAddress.evaluate(el => getComputedStyle(el).fontSize))
      .toBe('11px');
    await expect
      .poll(() => nativeSegwitBadge.evaluate(el => getComputedStyle(el).fontSize))
      .toBe('10px');
    await expect
      .poll(() => nativeSegwitBadge.evaluate(el => getComputedStyle(el).lineHeight))
      .toBe('12px');
    await expect
      .poll(() => nativeSegwitBadge.evaluate(el => getComputedStyle(el).paddingInline))
      .toBe('6px');
    await expect
      .poll(() => nativeSegwitAddress.evaluate(el => getComputedStyle(el).maxWidth))
      .toBe('50%');
    await expect
      .poll(async () => {
        const [addressFontFamily, titleFontFamily] = await Promise.all([
          nativeSegwitAddress.evaluate(el => getComputedStyle(el).fontFamily),
          nativeSegwitTitle.evaluate(el => getComputedStyle(el).fontFamily),
        ]);
        return addressFontFamily === titleFontFamily;
      })
      .toBe(true);
    expect(await nativeSegwitAddress.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const nativeSegwitAddressSuffix = nativeSegwitAddress.getByTestId(
      'copy-address-btc-native-segwit-address-suffix'
    );
    await expect(nativeSegwitAddressSuffix).toHaveText('499yq');
    expect(
      await nativeSegwitAddressSuffix.evaluate(suffix => {
        const address = suffix.parentElement;
        if (!address) return false;
        const addressRect = address.getBoundingClientRect();
        const suffixRect = suffix.getBoundingClientRect();
        return (
          suffixRect.left >= addressRect.left &&
          suffixRect.top >= addressRect.top &&
          suffixRect.right <= addressRect.right &&
          suffixRect.bottom <= addressRect.bottom
        );
      })
    ).toBe(true);

    const accountName = page.getByTestId(SettingsSelectors.CurrentAccountDisplayName);
    const [accountNameBox, menuTitleBox, nativeSegwitMenuItemBox] = await Promise.all([
      accountName.boundingBox(),
      menuTitle.boundingBox(),
      nativeSegwitMenuItem.boundingBox(),
    ]);
    if (!accountNameBox || !menuTitleBox || !nativeSegwitMenuItemBox) {
      throw new Error('Expected account name, menu title, and menu item to have bounding boxes');
    }
    expect(Math.abs(menuTitleBox.x - accountNameBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(nativeSegwitMenuItemBox.x - accountNameBox.x)).toBeLessThanOrEqual(1);

    const [nativeSegwitTitleBox, nativeSegwitAddressBox] = await Promise.all([
      nativeSegwitTitle.boundingBox(),
      nativeSegwitAddress.boundingBox(),
    ]);
    if (!nativeSegwitTitleBox || !nativeSegwitAddressBox) {
      throw new Error('Expected title and address to have bounding boxes');
    }
    expect(
      nativeSegwitAddressBox.y - (nativeSegwitTitleBox.y + nativeSegwitTitleBox.height)
    ).toBeLessThanOrEqual(1);
    await expect
      .poll(() => nativeSegwitBadge.evaluate(el => getComputedStyle(el).paddingBlock))
      .toBe('0px');

    const stxMenuItem = page.getByTestId('copy-address-stx');
    const [menuBox, stxMenuItemWrapperBox] = await Promise.all([
      page.getByRole('menu').boundingBox(),
      stxMenuItem.locator('..').boundingBox(),
    ]);
    if (!menuBox || !stxMenuItemWrapperBox) {
      throw new Error('Expected the menu and final item wrapper to have bounding boxes');
    }
    expect(
      menuBox.y + menuBox.height - (stxMenuItemWrapperBox.y + stxMenuItemWrapperBox.height)
    ).toBeGreaterThanOrEqual(8);

    await page.setViewportSize({ height: 600, width: 300 });
    const narrowMenuBox = await page.getByRole('menu').boundingBox();
    if (!narrowMenuBox) {
      throw new Error('Expected the menu to have a bounding box in the narrow viewport');
    }
    expect(narrowMenuBox.x).toBeGreaterThanOrEqual(8);
    expect(narrowMenuBox.x + narrowMenuBox.width).toBeLessThanOrEqual(292);
    await page.setViewportSize({ height: 600, width: 390 });

    const taprootCopyIcon = page.getByTestId('copy-address-btc-taproot-icon');
    const taprootAddress = page.getByTestId('copy-address-btc-taproot-address');
    const addressColorBeforeHover = await taprootAddress.evaluate(el => getComputedStyle(el).color);
    await expect.poll(() => taprootCopyIcon.evaluate(el => getComputedStyle(el).opacity)).toBe('0');
    const taprootMenuItem = page.getByTestId('copy-address-btc-taproot');
    await taprootMenuItem.hover();
    await expect.poll(() => taprootCopyIcon.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
    await expect
      .poll(() => taprootAddress.evaluate(el => getComputedStyle(el).color))
      .not.toBe(addressColorBeforeHover);
    await expect
      .poll(() => taprootAddress.evaluate(el => getComputedStyle(el).color))
      .toBe(await nativeSegwitTitle.evaluate(el => getComputedStyle(el).color));
    await expect
      .poll(() => taprootMenuItem.evaluate(el => getComputedStyle(el).cursor))
      .toBe('pointer');

    await page.getByTestId('copy-address-btc-taproot').click();

    await expect(page.getByText('Copied to clipboard!', { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/^bc1p/);
    await page.getByTestId(CopyAddressMenuBtn).click();
    await page.getByTestId('copy-address-stx').click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/^SP/);
  });

  test('reports a clipboard write failure', async ({ extensionId, page }) => {
    await page.setViewportSize({ height: 600, width: 390 });
    await page.goto(`chrome-extension://${extensionId}/action-popup.html`);
    await dismissFeatureIntroducerIfVisible(page);
    await page.evaluate(() => {
      navigator.clipboard.writeText = () => Promise.reject(new DOMException('Permission denied'));
    });

    await page.getByTestId(CopyAddressMenuBtn).click();
    await page.getByTestId('copy-address-btc-native-segwit').click();

    await expect(page.getByText('Failed to copy address', { exact: true })).toBeVisible();
    await expect(page.getByText('Copied to clipboard!', { exact: true })).toBeHidden();
  });
});
