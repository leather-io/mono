import type { Page } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

interface HeapSnapshot {
  snapshot: {
    meta: {
      node_fields: string[];
      node_types: string[][];
      edge_fields: string[];
      edge_types: string[][];
    };
  };
  nodes: number[];
  edges: number[];
  strings: string[];
}

async function takeHeapSnapshot(page: Page): Promise<HeapSnapshot> {
  const client = await page.context().newCDPSession(page);

  await client.send('HeapProfiler.enable');
  await client.send('HeapProfiler.collectGarbage');

  const snapshot = await new Promise<HeapSnapshot>((resolve, reject) => {
    const chunks: string[] = [];

    client.on('HeapProfiler.addHeapSnapshotChunk', (event: { chunk: string }) => {
      chunks.push(event.chunk);
    });

    client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false }).then(
      () => {
        try {
          const snapshotData = JSON.parse(chunks.join(''));
          resolve(snapshotData);
        } catch (error) {
          reject(error as Error);
        }
      },
      (error: any) => reject(error as Error)
    );
  });

  await client.send('HeapProfiler.disable');
  await client.detach();

  return snapshot;
}

function searchHeapForString(snapshot: HeapSnapshot, searchString: string): boolean {
  const strings = snapshot.strings;

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    if (typeof str === 'string' && str.includes(searchString)) {
      return true;
    }
  }

  return false;
}

function searchHeapForStringWithDetails(
  snapshot: HeapSnapshot,
  searchString: string
): { found: boolean; occurrences: string[]; count: number } {
  const strings = snapshot.strings;
  const occurrences: string[] = [];

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    if (typeof str === 'string' && str.includes(searchString)) {
      occurrences.push(str);
    }
  }

  return {
    found: occurrences.length > 0,
    occurrences,
    count: occurrences.length,
  };
}

test.describe('Security: Password Memory Leak', () => {
  test('that password is cleared from memory after locking wallet', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
    page,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);

    await homePage.page
      .getByTestId(SettingsSelectors.CurrentAccountDisplayName)
      .waitFor({ state: 'visible' });

    await homePage.lock();

    const unlockInput = page.getByTestId(SettingsSelectors.EnterPasswordInput);
    await unlockInput.waitFor({ state: 'visible' });
    await unlockInput.fill(TEST_PASSWORD);

    const unlockButton = page.getByTestId(SettingsSelectors.UnlockWalletBtn);
    await unlockButton.waitFor({ state: 'visible' });
    await unlockButton.click();

    await page
      .getByTestId(SettingsSelectors.CurrentAccountDisplayName)
      .waitFor({ state: 'visible' });

    await homePage.lock();

    await unlockInput.waitFor({ state: 'visible' });

    const snapshot = await takeHeapSnapshot(page);

    const passwordFoundInHeap = searchHeapForString(snapshot, TEST_PASSWORD);

    test.expect(passwordFoundInHeap).toBe(false);
  });

  test('that password is not in heap after unlock-lock cycle with garbage collection', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
    page,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);

    await homePage.page
      .getByTestId(SettingsSelectors.CurrentAccountDisplayName)
      .waitFor({ state: 'visible' });

    await homePage.lock();

    const unlockInput = page.getByTestId(SettingsSelectors.EnterPasswordInput);
    await unlockInput.waitFor({ state: 'visible' });
    await unlockInput.fill(TEST_PASSWORD);

    const unlockButton = page.getByTestId(SettingsSelectors.UnlockWalletBtn);
    await unlockButton.waitFor({ state: 'visible' });
    await unlockButton.click();

    await page
      .getByTestId(SettingsSelectors.CurrentAccountDisplayName)
      .waitFor({ state: 'visible' });

    await homePage.lock();

    await unlockInput.waitFor({ state: 'visible' });

    const client = await page.context().newCDPSession(page);
    await client.send('HeapProfiler.enable');
    await client.send('HeapProfiler.collectGarbage');
    await client.send('HeapProfiler.collectGarbage');
    await client.send('HeapProfiler.collectGarbage');
    await client.send('HeapProfiler.disable');
    await client.detach();

    const snapshot = await takeHeapSnapshot(page);

    const passwordFoundInHeap = searchHeapForString(snapshot, TEST_PASSWORD);

    test.expect(passwordFoundInHeap).toBe(false);
  });

  test('that password is not in heap with detailed occurrence reporting', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
    page,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);

    await homePage.page
      .getByTestId(SettingsSelectors.CurrentAccountDisplayName)
      .waitFor({ state: 'visible' });

    await homePage.lock();

    const unlockInput = page.getByTestId(SettingsSelectors.EnterPasswordInput);
    await unlockInput.waitFor({ state: 'visible' });
    await unlockInput.fill(TEST_PASSWORD);

    const unlockButton = page.getByTestId(SettingsSelectors.UnlockWalletBtn);
    await unlockButton.waitFor({ state: 'visible' });
    await unlockButton.click();

    await page
      .getByTestId(SettingsSelectors.CurrentAccountDisplayName)
      .waitFor({ state: 'visible' });

    await homePage.lock();

    await unlockInput.waitFor({ state: 'visible' });

    const client = await page.context().newCDPSession(page);
    await client.send('HeapProfiler.enable');
    await client.send('HeapProfiler.collectGarbage');
    await client.send('HeapProfiler.disable');
    await client.detach();

    const snapshot = await takeHeapSnapshot(page);

    const result = searchHeapForStringWithDetails(snapshot, TEST_PASSWORD);

    if (result.found) {
      // eslint-disable-next-line no-console
      console.error(`\n❌ Security Vulnerability Detected!`);
      // eslint-disable-next-line no-console
      console.error(`Password found ${result.count} time(s) in heap memory after locking wallet\n`);
      // eslint-disable-next-line no-console
      console.error(`Sample occurrences (first 3):`);
      result.occurrences.slice(0, 3).forEach((occurrence, index) => {
        // eslint-disable-next-line no-console
        console.error(`  ${index + 1}. "${occurrence}"`);
      });
      // eslint-disable-next-line no-console
      console.error('');
    }

    test.expect(result.found).toBe(false);
  });
});
