import type { BrowserContext } from '@playwright/test';
import { setupMockApis } from '@tests/mocks/mock-apis';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import { mockUnhandledRequests } from '@tests/mocks/mock-unhandled-requests';
import { keys } from 'remeda';

import { type MocksPlan, mockRegistry } from './mock-registry';
import type { MocksSummary } from './summary';

const defaultMockNames = ['mockUnhandledRequests', 'setupMockApis'];
const flagOverrideName = 'overrideLaunchDarklyFlags';

export async function installMocks(
  context: BrowserContext,
  mocks: MocksPlan,
  flags: Record<string, boolean>
): Promise<MocksSummary> {
  const installed: string[] = [];
  if (mocks.mode === 'default') {
    await mockUnhandledRequests(context);
    await setupMockApis(context);
    installed.push(...defaultMockNames);
    for (const name of mocks.extras) {
      await mockRegistry[name](context);
      installed.push(name);
    }
  }
  if (keys(flags).length > 0) {
    await overrideLaunchDarklyFlags(context, flags);
    installed.push(flagOverrideName);
  }
  return { mode: mocks.mode, installed };
}
