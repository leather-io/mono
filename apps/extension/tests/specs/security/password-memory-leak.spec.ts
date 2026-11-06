import type { Page } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { z } from 'zod';

import { test } from '../../fixtures/fixtures';

const heapSnapshotSchema = z.object({
  nodes: z.array(z.number()),
  edges: z.array(z.number()),
  strings: z.array(z.string()),
});

type HeapSnapshot = z.infer<typeof heapSnapshotSchema>;

async function takeHeapSnapshot(page: Page): Promise<HeapSnapshot> {
  const client = await page.context().newCDPSession(page);

  await client.send('HeapProfiler.enable');
  await client.send('HeapProfiler.collectGarbage');

  const chunks: string[] = [];

  client.on('HeapProfiler.addHeapSnapshotChunk', (event: { chunk: string }) => {
    chunks.push(event.chunk);
  });

  await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });

  const snapshotData: unknown = JSON.parse(chunks.join(''));
  const result = heapSnapshotSchema.safeParse(snapshotData);
  if (!result.success) throw new Error('Unexpected heap snapshot shape');

  await client.send('HeapProfiler.disable');
  await client.detach();

  return result.data;
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

const sampleOccurrenceCount = 3;

async function attachHeapOccurrences(result: ReturnType<typeof searchHeapForStringWithDetails>) {
  await test.info().attach('password-heap-occurrences', {
    body: JSON.stringify(result.occurrences.slice(0, sampleOccurrenceCount), null, 2),
    contentType: 'application/json',
  });
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
    await homePage.unlock();

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
    await homePage.unlock();

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
    await homePage.unlock();

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

    await attachHeapOccurrences(result);

    test
      .expect(
        result.found,
        `Password found ${result.count} time(s) in heap memory after locking wallet`
      )
      .toBe(false);
  });
});
