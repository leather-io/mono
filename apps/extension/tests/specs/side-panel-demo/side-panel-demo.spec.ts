import type { Page } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { testFingerprint } from '@tests/page-object-models/onboarding.page';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RouteUrls } from '@shared/route-urls';

import { test } from '../../fixtures/fixtures';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dirname, '../../../../../hackathon/shots');

const demoDappOrigin = 'localhost:3999';
const demoDappUrl = `http://${demoDappOrigin}`;

function getConnectedDemoAppPermissionsState() {
  return {
    appPermissions: {
      ids: [demoDappOrigin],
      entities: {
        [demoDappOrigin]: {
          origin: demoDappOrigin,
          fingerprint: testFingerprint,
          accountIndex: 0,
          requestedAccounts: '2024-01-01T00:00:00.000Z',
          networkMode: 'mainnet',
        },
      },
    },
  };
}

function logDemo(...parts: unknown[]) {
  process.stdout.write(`${parts.map(String).join(' ')}\n`);
}

function addTransferButtonToDapp(page: Page) {
  return page.evaluate(recipient => {
    window.addEventListener('message', e => ((window as any).__lastMsg = e.data));
    const btn = document.createElement('button');
    btn.id = 'demo-transfer';
    btn.textContent = 'demo transfer';
    btn.style.cssText = 'position:fixed;top:8px;left:8px;z-index:999999;padding:16px;';
    btn.addEventListener('click', () => {
      (window as any).__demoResult = undefined;
      void (window as any).LeatherProvider.request('stx_transferStx', {
        amount: 100,
        memo: 'side panel demo',
        recipient,
      })
        .then((r: unknown) => ((window as any).__demoResult = r))
        .catch((e: unknown) => ((window as any).__demoResult = e));
    });
    document.body.appendChild(btn);
  }, TEST_ACCOUNT_2_STX_ADDRESS);
}

test.describe('Side panel demo', () => {
  test.skip(
    process.env.SIDE_PANEL_DEMO !== 'true',
    'Set SIDE_PANEL_DEMO=true and serve hackathon/demo-dapp on :3999 to run this demo'
  );

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    test.setTimeout(120_000);
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedDemoAppPermissionsState());
  });

  test('wallet home renders at side panel size', async ({ context, extensionId }) => {
    const [background] = context.serviceWorkers();
    await test
      .expect(async () => {
        const state = await background.evaluate(async () => ({
          popup: await chrome.action.getPopup({}),
          options: await chrome.sidePanel.getOptions({}),
        }));
        test.expect(state.popup).toBe('');
        test.expect(state.options.enabled).toBe(true);
      })
      .toPass({ timeout: 10000 });

    const panel = await context.newPage();
    await panel.setViewportSize({ width: 400, height: 820 });
    await panel.goto(`chrome-extension://${extensionId}/side-panel.html`);
    await panel.waitForTimeout(4000);
    await panel.screenshot({ path: path.join(outDir, '01-side-panel-home.png') });
    await test.expect(panel.getByTestId(HomePageSelectors.HomePageContainer)).toBeVisible();
  });

  test('click-gesture request opens approval in the side panel and cancel returns home', async ({
    context,
    page,
    extensionId,
  }) => {
    await page.goto(demoDappUrl, { waitUntil: 'networkidle' });
    await addTransferButtonToDapp(page);

    const newPagePromise = context
      .waitForEvent('page', { timeout: 8000 })
      .then(p => p)
      .catch(() => null);

    await page.click('#demo-transfer');
    await page.waitForTimeout(3500);
    await test.expect(page.locator('#leather-side-panel-request-overlay')).toBeAttached();
    await page.screenshot({ path: path.join(outDir, '02-request-overlay-on-dapp.png') });

    const [background] = context.serviceWorkers();
    const panelState = await background.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      const dappTab = tabs.find(t => (t.url ?? '').includes('localhost:3999'));
      if (!dappTab?.id) return { error: 'no dapp tab found' };
      const options = await chrome.sidePanel.getOptions({ tabId: dappTab.id });
      return { tabId: dappTab.id, options };
    });
    logDemo('per-tab side panel state after click:', JSON.stringify(panelState));

    const newPage = await newPagePromise;
    logDemo('new page target after click:', newPage ? newPage.url() : 'none');

    const panelPath: string | undefined = (panelState as any).options?.path;
    test.expect(panelPath).toContain('side-panel.html#/');
    test.expect(newPage?.url().includes('popup.html') ?? false).toBe(false);

    const approval = await context.newPage();
    approval.on('console', msg => logDemo('approval console:', msg.type(), msg.text()));
    approval.on('pageerror', error => logDemo('approval pageerror:', error.message));
    await approval.setViewportSize({ width: 400, height: 820 });
    await approval.goto(`chrome-extension://${extensionId}/${panelPath}`);
    await approval.waitForTimeout(4000);
    await approval.screenshot({ path: path.join(outDir, '02-approval-in-side-panel.png') });

    await approval.locator('text="Cancel"').click();

    await page
      .waitForFunction(() => (window as any).__demoResult !== undefined, undefined, {
        timeout: 10000,
      })
      .catch(() => null);
    const lastMsg = await page.evaluate(() => (window as any).__lastMsg);
    logDemo('dapp last window message:', JSON.stringify(lastMsg));

    await approval.waitForTimeout(1500);
    await test.expect(page.locator('#leather-side-panel-request-overlay')).not.toBeAttached();
    logDemo('approval doc url after cancel:', approval.url());
    test.expect(approval.url()).toContain('side-panel.html');
    test.expect(approval.url()).not.toContain('#/');
    await approval.screenshot({ path: path.join(outDir, '03-side-panel-back-home.png') });

    const resetState = await background.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      const dappTab = tabs.find(t => (t.url ?? '').includes('localhost:3999'));
      if (!dappTab?.id) return { error: 'no dapp tab found' };
      const options = await chrome.sidePanel.getOptions({ tabId: dappTab.id });
      return { options };
    });
    logDemo('per-tab side panel state after cancel:', JSON.stringify(resetState));
    test.expect(JSON.stringify(resetState)).not.toContain('#/');

    const dappResult = await page.evaluate(() => (window as any).__demoResult);
    logDemo('dapp received:', JSON.stringify(dappResult));
    test.expect(dappResult?.error?.code).toBe(4001);
  });

  test('get addresses approval renders and approves in the side panel', async ({
    context,
    page,
    extensionId,
  }) => {
    await page.goto(demoDappUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'demo-connect';
      btn.textContent = 'demo connect';
      btn.style.cssText = 'position:fixed;top:8px;left:160px;z-index:999999;padding:16px;';
      btn.addEventListener('click', () => {
        void (window as any).LeatherProvider.request('getAddresses')
          .then((r: unknown) => ((window as any).__demoResult = r))
          .catch((e: unknown) => ((window as any).__demoResult = e));
      });
      document.body.appendChild(btn);
    });
    await page.click('#demo-connect');
    await page.waitForTimeout(3500);

    const [background] = context.serviceWorkers();
    const panelState = await background.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      const dappTab = tabs.find(t => (t.url ?? '').includes('localhost:3999'));
      if (!dappTab?.id) return { error: 'no dapp tab found' };
      return { options: await chrome.sidePanel.getOptions({ tabId: dappTab.id }) };
    });
    const panelPath: string | undefined = (panelState as any).options?.path;
    test.expect(panelPath).toContain('get-addresses');

    const approval = await context.newPage();
    await approval.setViewportSize({ width: 400, height: 820 });
    await approval.goto(`chrome-extension://${extensionId}/${panelPath}`);
    const approveButton = approval.getByTestId('get-addresses-approve-button');
    await test.expect(approveButton).toBeVisible({ timeout: 10000 });
    await approval.waitForTimeout(1500);
    await approval.screenshot({ path: path.join(outDir, '04-connect-approval-in-side-panel.png') });
    await approveButton.click();

    await page
      .waitForFunction(() => (window as any).__demoResult !== undefined, undefined, {
        timeout: 15000,
      })
      .catch(() => null);
    const dappResult = await page.evaluate(() => (window as any).__demoResult);
    logDemo('connect result:', JSON.stringify(dappResult).slice(0, 200));
    test.expect(Array.isArray(dappResult?.result?.addresses)).toBe(true);
  });

  test('request arriving while panel doc sits at home hands off to the approval', async ({
    context,
    page,
    extensionId,
  }) => {
    const panelSim = await context.newPage();
    await panelSim.setViewportSize({ width: 400, height: 820 });
    await panelSim.goto(`chrome-extension://${extensionId}/side-panel.html`);
    await panelSim.waitForTimeout(3000);

    await page.goto(demoDappUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'demo-connect-handoff';
      btn.textContent = 'demo connect';
      btn.style.cssText = 'position:fixed;top:8px;left:320px;z-index:999999;padding:16px;';
      btn.addEventListener('click', () => {
        void (window as any).LeatherProvider.request('getAddresses').catch((e: unknown) => e);
      });
      document.body.appendChild(btn);
    });
    await page.click('#demo-connect-handoff');
    await page.waitForTimeout(4000);

    test.expect(panelSim.url()).toContain('get-addresses');
    test.expect(panelSim.url()).toContain('rpcRequest=');
    await test.expect(panelSim.getByTestId('get-addresses-approve-button')).toBeVisible();
  });

  test('turning sidebar mode off restores the action popup', async ({ context, extensionId }) => {
    const [background] = context.serviceWorkers();

    function readMode() {
      return background.evaluate(async () => ({
        popup: await chrome.action.getPopup({}),
        enabled: (await chrome.sidePanel.getOptions({})).enabled,
      }));
    }

    await test
      .expect(async () => test.expect(await readMode()).toEqual({ popup: '', enabled: true }))
      .toPass({ timeout: 10000 });

    const settings = await context.newPage();
    await settings.goto(`chrome-extension://${extensionId}/index.html#${RouteUrls.Settings}`);
    await settings.getByTestId(SettingsSelectors.ToggleSidePanelMode).click();

    await test
      .expect(async () => {
        const mode = await readMode();
        test.expect(mode.popup).toContain('action-popup.html');
        test.expect(mode.enabled).toBe(false);
      })
      .toPass({ timeout: 10000 });

    await settings.getByTestId(SettingsSelectors.ToggleSidePanelMode).click();
    await test
      .expect(async () => test.expect(await readMode()).toEqual({ popup: '', enabled: true }))
      .toPass({ timeout: 10000 });
  });

  test('open panel closes by window, not by tab', async ({ context, page }) => {
    await page.goto(demoDappUrl, { waitUntil: 'networkidle' });
    await addTransferButtonToDapp(page);
    await page.click('#demo-transfer');
    await page.waitForTimeout(3500);

    const [background] = context.serviceWorkers();
    function countPanels() {
      return background.evaluate(async () => {
        const contexts = await chrome.runtime.getContexts({});
        return contexts.filter(c => (c.documentUrl ?? '').includes('side-panel.html')).length;
      });
    }
    test.expect(await countPanels()).toBe(1);

    // Closing by tab resolves but leaves the panel open
    await background.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      const dappTab = tabs.find(t => (t.url ?? '').includes('localhost:3999'));
      if (dappTab?.id) await chrome.sidePanel.close({ tabId: dappTab.id });
    });
    await page.waitForTimeout(2000);
    test.expect(await countPanels()).toBe(1);

    await background.evaluate(async () => {
      const currentWindow = await chrome.windows.getLastFocused();
      if (currentWindow.id) await chrome.sidePanel.close({ windowId: currentWindow.id });
    });
    await test.expect.poll(countPanels, { timeout: 10000 }).toBe(0);
  });

  test('request without user gesture offers an in-page action that opens the panel', async ({
    context,
    page,
  }) => {
    await page.goto(demoDappUrl, { waitUntil: 'networkidle' });

    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    function countPanelContexts() {
      return background.evaluate(async () => {
        const contexts = await chrome.runtime.getContexts({});
        return contexts.filter(c => (c.documentUrl ?? '').includes('side-panel.html')).length;
      });
    }

    test.expect(await countPanelContexts()).toBe(0);

    await page.evaluate(recipient => {
      setTimeout(() => {
        void (window as any).LeatherProvider.request('stx_transferStx', {
          amount: 100,
          recipient,
        }).catch((e: unknown) => e);
      }, 6000);
    }, TEST_ACCOUNT_2_STX_ADDRESS);

    function getCtaCentre() {
      return page.evaluate(() => {
        const host = document.getElementById('leather-side-panel-request-overlay');
        const cta = host?.shadowRoot?.getElementById('leather-overlay-cta');
        const rect = cta?.getBoundingClientRect();
        return rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : null;
      });
    }

    // Leave the page untouched: page.evaluate would grant user activation
    await page.waitForTimeout(9000);

    await test.expect
      .poll(async () => Boolean(await getCtaCentre()), { timeout: 15000 })
      .toBe(true);
    await page.screenshot({ path: path.join(outDir, '06-overlay-action-required.png') });

    test.expect(context.pages().every(p => !p.url().includes('popup.html'))).toBe(true);

    // Real mouse click so the event is trusted
    const centre = await getCtaCentre();
    if (!centre) throw new Error('Overlay call to action never rendered');
    await page.mouse.click(centre.x, centre.y);

    await test
      .expect(async () => test.expect(await countPanelContexts()).toBeGreaterThan(0))
      .toPass({ timeout: 15000 });
    logDemo('panel contexts after cta click:', String(await countPanelContexts()));

    function getOverlayDescription() {
      return page.evaluate(() => {
        const host = document.getElementById('leather-side-panel-request-overlay');
        return host?.shadowRoot?.getElementById('leather-overlay-description')?.textContent ?? null;
      });
    }
    await test.expect
      .poll(getOverlayDescription, { timeout: 10000 })
      .toContain('Review and approve or reject the transaction');
    await test.expect.poll(getCtaCentre, { timeout: 10000 }).toBeNull();
  });
});

test.describe('Side panel availability', () => {
  test.skip(
    process.env.SIDE_PANEL_DEMO !== 'true',
    'Set SIDE_PANEL_DEMO=true and serve hackathon/demo-dapp on :3999 to run this demo'
  );

  test('zero state keeps the action popup and disables the panel', async ({ context }) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    await test
      .expect(async () => {
        const state = await background.evaluate(async () => ({
          popup: await chrome.action.getPopup({}),
          options: await chrome.sidePanel.getOptions({}),
        }));
        test.expect(state.popup).toContain('action-popup.html');
        test.expect(state.options.enabled).toBe(false);
      })
      .toPass({ timeout: 10000 });
  });
});
