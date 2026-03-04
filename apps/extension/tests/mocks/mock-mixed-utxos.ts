import type { Page } from '@playwright/test';

import { TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, TEST_ACCOUNT_1_TAPROOT_ADDRESS } from './constants';

export const mockNativeSegwitUtxo = {
  txid: 'aabb1122334455667788990011223344aabb5566778899aabbccddeeff001122',
  vout: 0,
  value: '200000',
  height: 810300,
  address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  path: "m/84'/0'/0'/0/0",
};

export const mockTaprootUtxo = {
  txid: 'ccdd3344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
  vout: 0,
  value: '300000',
  height: 810300,
  address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  path: "m/86'/0'/0'/0/0",
};

export async function mockMixedUtxosForSend(page: Page) {
  await page.unroute('**/v1/utxos/**');
  await page.route('**/v1/utxos/**', route => {
    const url = route.request().url();
    if (url.includes(encodeURIComponent('tr('))) {
      return route.fulfill({ json: [mockTaprootUtxo] });
    }
    return route.fulfill({ json: [mockNativeSegwitUtxo] });
  });
}
