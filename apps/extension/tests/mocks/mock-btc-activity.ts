import type { Page } from '@playwright/test';

import { TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS } from './constants';

const pendingBtcTxid = '7438bd24579108a85fbf77756e7b9c87238b947dd0f858f6e30bad4f4d6d557a';

const pendingBtcSendLeatherApi = {
  txid: pendingBtcTxid,
  vin: [
    {
      n: 0,
      txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
      owned: true,
      address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      path: "m/84'/0'/0'/0/0",
      value: '50000',
    },
  ],
  vout: [
    {
      n: 0,
      address: 'bc1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
      value: '40000',
    },
    {
      n: 1,
      owned: true,
      address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      path: "m/84'/0'/0'/1/0",
      value: '5000',
    },
  ],
};

const pendingBtcTxMempool = {
  txid: pendingBtcTxid,
  version: 2,
  locktime: 0,
  vin: [
    {
      txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
      vout: 0,
      prevout: {
        scriptpubkey: '0014a45f45569def6b891c9fccca813f6d31ab52b4b1',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 a45f45569def6b891c9fccca813f6d31ab52b4b1',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
        value: 50000,
      },
      scriptsig: '',
      scriptsig_asm: '',
      witness: ['3045022100abcdef', '02abcdef'],
      is_coinbase: false,
      sequence: 4294967293,
    },
  ],
  vout: [
    {
      scriptpubkey: '00148027825ee06ad337f9716df8137a1b651163c5b0',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 8027825ee06ad337f9716df8137a1b651163c5b0',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: 'bc1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
      value: 40000,
    },
    {
      scriptpubkey: '0014a45f45569def6b891c9fccca813f6d31ab52b4b1',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 a45f45569def6b891c9fccca813f6d31ab52b4b1',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      value: 5000,
    },
  ],
  size: 222,
  weight: 561,
  fee: 5000,
  status: {
    confirmed: false,
  },
};

export async function mockBitcoinPendingSendActivity(page: Page) {
  await page.unroute('**/v1/transactions/**');

  await page.route('**/v1/transactions/**', route =>
    route.fulfill({
      json: {
        meta: { page: 1, pageSize: 1, totalPages: 1, totalItems: 1 },
        data: [pendingBtcSendLeatherApi],
      },
    })
  );
}

export async function mockBitcoinPendingTxById(page: Page) {
  await page.route(`**/leather.mempool.space/api/tx/${pendingBtcTxid}`, route =>
    route.fulfill({ json: pendingBtcTxMempool })
  );
}

export async function mockBitcoinBroadcastTransaction(page: Page) {
  await page.route('**/leather.mempool.space/api/tx', route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ body: pendingBtcTxid });
    }
    return route.continue();
  });
}
