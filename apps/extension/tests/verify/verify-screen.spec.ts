import { type BrowserContext, type Page, expect } from '@playwright/test';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import type { GlobalPage } from '@tests/page-object-models/global.page';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';

import {
  type VerifyPageObjectName,
  type VerifyRpcSummary,
  type VerifyRun,
  parseVerifyEnv,
  verifyPageObjectNames,
} from '@leather.io/tools/verify-contract';

import { test } from '../fixtures/fixtures';
import { type Capture, createCapture, readyLocator, waitForReady, writeArtifacts } from './capture';
import { applyMocks } from './mock-registry';
import {
  type ResolvedRpcRequest,
  dispatchRpcRequest,
  resolveRpcRequest,
  settleRpcResponse,
  testAppUrl,
} from './rpc';
import { establishSession } from './session';

const sessionSetupTimeoutMs = 90_000;
const providerStatusTestId = 'provider-status';

type PageObjects = Readonly<Record<VerifyPageObjectName, object>>;

async function runOpenActions(open: readonly string[], pageObjects: PageObjects) {
  for (const action of open) {
    const [className, methodName] = action.split('.');
    const exposedName = verifyPageObjectNames.find(name => name === className);
    const pageObject = exposedName === undefined ? undefined : pageObjects[exposedName];
    const method: unknown =
      pageObject && methodName ? Reflect.get(pageObject, methodName) : undefined;
    if (!pageObject || typeof method !== 'function') {
      throw new Error(
        `verify: open action '${action}' is not a method of the page objects the fixtures expose (${Object.keys(pageObjects).join(', ')}).`
      );
    }
    await Reflect.apply(method, pageObject, []);
  }
}

interface RpcOutcome {
  readonly target: Page;
  readonly summary: VerifyRpcSummary;
  readonly request: ResolvedRpcRequest;
}

async function driveRpc(
  page: Page,
  context: BrowserContext,
  rpc: Parameters<typeof resolveRpcRequest>[0],
  network: string
): Promise<RpcOutcome> {
  await page.goto(testAppUrl);
  await page.getByTestId(providerStatusTestId).waitFor();
  const request = await resolveRpcRequest(rpc, page, context, network);
  const dispatched = await dispatchRpcRequest(page, context, request);
  const target = dispatched.popup ?? page;
  if (dispatched.popup) await dispatched.popup.waitForLoadState();
  return {
    target,
    request,
    summary: {
      method: request.method,
      source: request.source,
      ...(request.catalogId === undefined ? {} : { catalogId: request.catalogId }),
      popupUrl: dispatched.popup?.url() ?? null,
      response: await settleRpcResponse(dispatched.response),
    },
  };
}

async function openExtensionRoot(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
  await page
    .getByTestId(OnboardingSelectors.SignUpBtn)
    .or(page.getByTestId(HomePageSelectors.HomePageContainer))
    .first()
    .waitFor();
}

async function prepareExtension(
  hermetic: boolean,
  page: Page,
  extensionId: string,
  globalPage: GlobalPage
) {
  if (hermetic) await globalPage.setupAndUseApiCalls(extensionId);
  else await openExtensionRoot(page, extensionId);
}

interface Target {
  readonly page: Page;
  readonly rpc?: RpcOutcome;
}

async function openTarget(
  run: VerifyRun,
  page: Page,
  context: BrowserContext,
  extensionId: string,
  pageObjects: PageObjects
): Promise<Target> {
  if (run.rpc) {
    const rpc = await driveRpc(page, context, run.rpc, run.network);
    return { page: rpc.target, rpc };
  }
  await page.goto(`chrome-extension://${extensionId}/index.html#${run.route}`);
  await runOpenActions(run.open, pageObjects);
  return { page };
}

test.describe('Verify screen', () => {
  test('opens the mapped screen and captures artifacts', async ({
    context,
    page,
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
    sendPage,
    swapRevampPage,
    networkPage,
    settingsPage,
    switchAccountPage,
  }) => {
    const run = parseVerifyEnv(process.env);
    test.setTimeout(run.readyTimeoutMs + sessionSetupTimeoutMs);
    const hermetic = run.mocksMode !== 'none';
    const capture: Capture = createCapture(context, hermetic);

    await prepareExtension(hermetic, page, extensionId, globalPage);
    await overrideLaunchDarklyFlags(context, run.flags);
    const mocks = await applyMocks(run.mocks, context, page);
    await establishSession(run, { extensionId, onboardingPage, homePage });

    const target = await openTarget(run, page, context, extensionId, {
      GlobalPage: globalPage,
      HomePage: homePage,
      OnboardingPage: onboardingPage,
      SendPage: sendPage,
      SwapRevampPage: swapRevampPage,
      NetworkPage: networkPage,
      SettingsPage: settingsPage,
      SwitchAccountPage: switchAccountPage,
    });

    const ready = await waitForReady(target.page, run.ready, run.readyTimeoutMs);
    await writeArtifacts({
      run,
      page: target.page,
      context,
      extensionId,
      capture,
      ready,
      mocks,
      rpc: target.rpc?.summary,
      rpcRequest: target.rpc
        ? { method: target.rpc.request.method, params: target.rpc.request.params }
        : undefined,
    });

    await expect(readyLocator(target.page, run.ready)).toBeAttached();
  });
});
