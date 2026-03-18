import { expect } from '@playwright/test';
import { TEST_ACCOUNT_1_TAPROOT_ADDRESS } from '@tests/mocks/constants';
import { bisMainnetInscriptionsUrlRegex } from '@tests/mocks/mock-inscriptions-bis';

import type { BestInSlotInscriptionResponse } from '@leather.io/query';

import { test } from '../../fixtures/fixtures';

function generateMockInscriptions(count: number): BestInSlotInscriptionResponse[] {
  return Array.from({ length: count }, (_, i) => {
    const hexIndex = i.toString(16).padStart(64, '0');
    return {
      inscription_name: null,
      inscription_id: `${hexIndex}i0`,
      inscription_number: i,
      parent_ids: [],
      metadata: null,
      owner_wallet_addr: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
      mime_type: 'text/plain;charset=utf-8',
      last_sale_price: null,
      slug: null,
      collection_name: null,
      satpoint: `${hexIndex}:0:0`,
      last_transfer_block_height: 919338,
      genesis_height: 919326,
      content_url: `https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/${hexIndex}i0`,
      bis_url: `https://bestinslot.xyz/ordinals/inscription/${hexIndex}i0`,
      render_url: null,
      bitmap_number: null,
      delegate: null,
      output_value: 546,
      genesis_ts: '2025-10-16T10:32:22.000Z',
      genesis_block_hash: '00000000000000000001d1989a852677e88d0f5cb37e9fd57613256778e80a7a',
    };
  });
}

test.describe('Inscription pagination', () => {
  const totalInscriptions = 2100;
  const allInscriptions = generateMockInscriptions(totalInscriptions);
  const bisRequestOffsets: number[] = [];

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    bisRequestOffsets.length = 0;

    await globalPage.setupAndUseApiCalls(extensionId);

    await page.unroute(bisMainnetInscriptionsUrlRegex);
    await page.route(bisMainnetInscriptionsUrlRegex, async route => {
      const url = new URL(route.request().url());

      if (!url.searchParams.get('xpub')?.startsWith('tr')) {
        return route.fulfill({ json: { block_height: 919341, data: [] } });
      }

      const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);
      const count = parseInt(url.searchParams.get('count') ?? '2000', 10);
      bisRequestOffsets.push(offset);

      const pageData = allInscriptions.slice(offset, offset + count);
      return route.fulfill({ json: { block_height: 919341, data: pageData } });
    });

    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('fetches all inscriptions across paginated BIS responses', async ({ homePage, page }) => {
    test.slow();

    await homePage.clickCollectiblesTab();

    await page.getByTestId('manage-collectibles-btn').waitFor();
    await page.getByTestId('manage-collectibles-btn').click();
    await page.getByTestId('unprotect-all-inscriptions').click();

    await page.waitForTimeout(500);

    const discardedInscriptions = await page.evaluate(async () => {
      const data = await chrome.storage.local.get(['persist:root']);
      return data['persist:root']?.settings?.discardedInscriptions ?? [];
    });

    expect(discardedInscriptions).toHaveLength(totalInscriptions);
    expect(bisRequestOffsets).toContain(0);
    expect(bisRequestOffsets).toContain(2000);
  });
});
