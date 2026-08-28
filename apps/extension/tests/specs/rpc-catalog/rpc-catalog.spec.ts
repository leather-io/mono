import type { BrowserContext, Page } from '@playwright/test';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';

import { type RequestContext, resolveParams, rpcMethods } from '@leather.io/test-app/catalog';

import { test } from '../../fixtures/fixtures';

const hostPage = 'localhost:3000';

function findSpec(id: string) {
  const spec = rpcMethods.find(m => m.id === id);
  if (!spec) throw new Error(`No catalog entry with id ${id}`);
  return spec;
}

// Backs the catalog's builders with the real provider inside the page, so a
// spec resolves the exact payload a click on the same card would send.
function pageRequestContext(page: Page): RequestContext {
  return {
    request(method, params) {
      const args: [string, unknown] = [method, params];
      return page.evaluate(async ([m, p]) => {
        const provider: unknown = Reflect.get(window, 'LeatherProvider');
        const hasRequest = (
          value: unknown
        ): value is { request(method: string, params?: unknown): Promise<{ result: unknown }> } =>
          typeof value === 'object' &&
          value !== null &&
          'request' in value &&
          typeof value.request === 'function';
        if (!hasRequest(provider)) throw new Error('LeatherProvider missing');
        const response = await provider.request(m, p);
        return response.result;
      }, args);
    },
  };
}

function interceptRequestPopup(context: BrowserContext) {
  return context.waitForEvent('page');
}

async function readResultJson(page: Page, testId: 'rpc-result-params' | 'rpc-result-payload') {
  const text = await page.getByTestId(testId).textContent();
  return JSON.parse(text ?? 'null');
}

test.describe('Rpc: test-app catalog', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto(hostPage);
  });

  test('renders one card per catalog entry and detects the provider', async ({ page }) => {
    await test
      .expect(page.getByTestId('provider-status'))
      .toHaveAttribute('data-installed', 'true');
    await test.expect(page.locator('button[data-testid]')).toHaveCount(rpcMethods.length);
    await test.expect(page.getByTestId('rpc-result')).toHaveAttribute('data-status', 'idle');
  });

  test('catalog payload resolved via evaluate matches the UI-driven request', async ({
    page,
    context,
  }) => {
    // 1. Payload straight from the catalog (no UI).
    const spec = findSpec('signMessage-p2wpkh');
    const params = await resolveParams(spec, pageRequestContext(page));

    // 2. Same entry driven through the UI.
    const popupPromise = interceptRequestPopup(context);
    await page.getByTestId(spec.id).click();
    const popup = await popupPromise;
    await popup.locator('text="Sign"').click();

    const result = page.getByTestId('rpc-result');
    await test.expect(result).toHaveAttribute('data-status', 'success');
    await test.expect(result).toHaveAttribute('data-method', spec.method);
    await test.expect(result).toHaveAttribute('data-id', spec.id);
    test.expect(await readResultJson(page, 'rpc-result-params')).toEqual(params);
  });

  test('builder entries derive their PSBT from the connected wallet and sign it', async ({
    page,
    context,
  }) => {
    const spec = findSpec('signPsbt');

    // The builder asks for the wallet's addresses first, then the PSBT prompt.
    const addressesPopupPromise = interceptRequestPopup(context);
    await page.getByTestId(spec.id).click();
    const addressesPopup = await addressesPopupPromise;
    const signPopupPromise = interceptRequestPopup(context);
    await addressesPopup.getByTestId('get-addresses-approve-button').click();
    const signPopup = await signPopupPromise;
    await signPopup.locator('text="Confirm"').click();

    const result = page.getByTestId('rpc-result');
    await test.expect(result).toHaveAttribute('data-status', 'success', { timeout: 15_000 });
    test.expect(await readResultJson(page, 'rpc-result-params')).toMatchObject({
      hex: test.expect.any(String),
      broadcast: false,
    });
    test.expect(await readResultJson(page, 'rpc-result-payload')).toMatchObject({
      jsonrpc: '2.0',
      result: { hex: test.expect.any(String) },
    });
  });
});
