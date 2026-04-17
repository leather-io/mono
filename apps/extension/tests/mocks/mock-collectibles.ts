import type { Page } from '@playwright/test';

import { BESTINSLOT_API_BASE_URL_TESTNET } from '@leather.io/models';
import type { BestInSlotInscriptionResponse } from '@leather.io/query';

import { TEST_ACCOUNT_1_TAPROOT_ADDRESS } from './constants';
import { bisMainnetInscriptionsUrlRegex } from './mock-inscriptions-bis';

// IMPORTANT: owner_wallet_addr MUST be an address derivable from the test mnemonic.
// SendInscriptionContainer calls lookupDerivationByAddress to verify ownership.
// If the address doesn't match, it throws inside useEffect and crashes the extension,
// causing "Target page, context or browser has been closed" in every inscription E2E test.
export const mockImageInscription: BestInSlotInscriptionResponse = {
  inscription_name: 'Cryptomancer #291',
  inscription_id: '01b4fd6e4df1e69da196536bb6fca37b662401213e40508f3a541c60e806e2a7i0',
  inscription_number: 73850611,
  parent_ids: [],
  metadata: { name: 'Cryptomancer #291' },
  owner_wallet_addr: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  mime_type: 'image/webp',
  last_sale_price: null,
  slug: 'bcg_cryptomancers',
  collection_name: 'Cryptomancers',
  satpoint: '6292bd02652e4d33e6c54c3f55bdd84e6f2b7ae39d6b99b403117791f45008cf:0:0',
  last_transfer_block_height: 910801,
  genesis_height: 855706,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/01b4fd6e4df1e69da196536bb6fca37b662401213e40508f3a541c60e806e2a7i0',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/01b4fd6e4df1e69da196536bb6fca37b662401213e40508f3a541c60e806e2a7i0',
  render_url: null,
  bitmap_number: null,
  delegate: null,
  output_value: 546,
  genesis_ts: '2024-08-06T23:16:44.000Z',
  genesis_block_hash: '000000000000000000020d03a0ad0421b97ef97a61de9fbc04e3a0eb159775bb',
};

export const mockTextInscription: BestInSlotInscriptionResponse = {
  inscription_name: null,
  inscription_id: 'd2a07c26341750821da638f5da2fb00db6eacca71762e0919a14c947611c973fi0',
  inscription_number: 107315145,
  parent_ids: [],
  metadata: null,
  owner_wallet_addr: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  mime_type: 'text/plain;charset=utf-8',
  last_sale_price: null,
  slug: null,
  collection_name: null,
  satpoint: '6a90e24b03a5c0b9bf6dec4a3846defca53fe776daa19c3663c00883c4f57caf:0:0',
  last_transfer_block_height: 919338,
  genesis_height: 919326,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/d2a07c26341750821da638f5da2fb00db6eacca71762e0919a14c947611c973fi0',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/d2a07c26341750821da638f5da2fb00db6eacca71762e0919a14c947611c973fi0',
  render_url: null,
  bitmap_number: null,
  delegate: null,
  output_value: 546,
  genesis_ts: '2025-10-16T10:32:22.000Z',
  genesis_block_hash: '00000000000000000001d1989a852677e88d0f5cb37e9fd57613256778e80a7a',
};

export const mockHtmlInscription: BestInSlotInscriptionResponse = {
  inscription_name: null,
  inscription_id: 'edc6c6ac70a1b27557e6b37c0e34219b65945ff2ded18c6188dba29bf969a713i3',
  inscription_number: 71788568,
  parent_ids: [],
  metadata: null,
  owner_wallet_addr: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  mime_type: 'text/html;charset=utf-8',
  last_sale_price: null,
  slug: null,
  collection_name: null,
  satpoint: '6292bd02652e4d33e6c54c3f55bdd84e6f2b7ae39d6b99b403117791f45008cf:13:0',
  last_transfer_block_height: 910801,
  genesis_height: 848797,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/edc6c6ac70a1b27557e6b37c0e34219b65945ff2ded18c6188dba29bf969a713i3',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/edc6c6ac70a1b27557e6b37c0e34219b65945ff2ded18c6188dba29bf969a713i3',
  render_url:
    'https://bis-ord-renders.fra1.cdn.digitaloceanspaces.com/renders/edc6c6ac70a1b27557e6b37c0e34219b65945ff2ded18c6188dba29bf969a713i3.png',
  bitmap_number: null,
  delegate: {
    delegate_id: '7dacda7d2d9f97709a681d23373d67081e23e4ffbf4853c14ffcbe8ace6c5973i0',
    render_url:
      'https://bis-ord-renders.fra1.cdn.digitaloceanspaces.com/renders/7dacda7d2d9f97709a681d23373d67081e23e4ffbf4853c14ffcbe8ace6c5973i0.png',
    mime_type: 'text/html;charset=utf-8',
    content_url:
      'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/7dacda7d2d9f97709a681d23373d67081e23e4ffbf4853c14ffcbe8ace6c5973i0',
    bis_url:
      'https://bestinslot.xyz/ordinals/inscription/7dacda7d2d9f97709a681d23373d67081e23e4ffbf4853c14ffcbe8ace6c5973i0',
  },
  output_value: 546,
  genesis_ts: '2024-06-20T21:03:50.000Z',
  genesis_block_hash: '00000000000000000001012a21454c554016196851ee422ef50644375ead0324',
};

export async function mockMainnetInscriptionsWithData(
  page: Page,
  inscriptions: BestInSlotInscriptionResponse[]
) {
  await page.unroute(bisMainnetInscriptionsUrlRegex);
  await page.route(bisMainnetInscriptionsUrlRegex, async route => {
    // Only return inscriptions for taproot xpub queries. The app queries
    // BIS for both taproot and native segwit xpubs, then combines results
    // without deduplication. Returning inscriptions for both causes the
    // same inscription to be counted twice, triggering a false "multiple
    // inscriptions on utxo" error in the send inscription flow.
    if (route.request().url().includes('xpub=tr')) {
      await route.fulfill({
        json: { block_height: 919341, data: inscriptions },
      });
      return;
    }
    await route.fulfill({ json: { block_height: 919341, data: [] } });
  });
}

export async function mockEmptyCollectibles(page: Page) {
  await page.unroute(bisMainnetInscriptionsUrlRegex);
  await Promise.all([
    page.route(bisMainnetInscriptionsUrlRegex, async route =>
      route.fulfill({ json: { block_height: 919341, data: [] } })
    ),
    page.route(
      new RegExp(`${BESTINSLOT_API_BASE_URL_TESTNET}/wallet/inscriptions_xpub.*`),
      async route => route.fulfill({ json: { block_height: 919341, data: [] } })
    ),
    page.route('**/api.hiro.so/extended/v1/tokens/nft/holdings*', route =>
      route.fulfill({ json: { limit: 50, offset: 0, total: 0, results: [] } })
    ),
  ]);
}
