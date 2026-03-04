import type { Page } from '@playwright/test';

import type { BitcoinTx } from '@leather.io/models';

import { TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, TEST_ACCOUNT_1_TAPROOT_ADDRESS } from './constants';

// Outbound transaction with only taproot inputs (no native segwit).
// Input:  200,000 sats from taproot address
// Output: 198,000 sats to external recipient
// Fee:    2,000 sats
// Net outgoing (getBitcoinTxValue): 0 - 200,000 = -200,000 sats = -0.002 BTC
export const mockTaprootOnlySendTx: BitcoinTx = {
  txid: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  version: 2,
  locktime: 0,
  vin: [
    {
      txid: 'cccc1111dddd2222eeee3333ffff4444aaaa5555bbbb6666cccc7777dddd8888',
      vout: 0,
      prevout: {
        scriptpubkey: '51200be4124bf11363a7294b2412d27bdce30c3800bc6b84e5a46965b9cddb23e492',
        scriptpubkey_asm:
          'OP_PUSHNUM_1 OP_PUSHBYTES_32 0be4124bf11363a7294b2412d27bdce30c3800bc6b84e5a46965b9cddb23e492',
        scriptpubkey_type: 'v1_p2tr',
        scriptpubkey_address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
        value: 200000,
      },
      scriptsig: '',
      scriptsig_asm: '',
      witness: [
        'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
      ],
      is_coinbase: false,
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      scriptpubkey: '0014751e76e8199196d454941c45d1b3a323f1433bd6',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 751e76e8199196d454941c45d1b3a323f1433bd6',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      value: 198000,
    },
  ],
  size: 150,
  weight: 396,
  fee: 2000,
  status: {
    confirmed: true,
    block_height: 810600,
    block_hash: '00000000000000000003a7c4c1e48d76c5a37902165a270156b7a8d72f8804b7',
    block_time: 1696400000,
  },
};

// Inbound transaction to taproot address (no native segwit involvement).
// Input:  151,000 sats from external address
// Output: 150,000 sats to test account taproot address
// Fee:    1,000 sats
// Net incoming (getBitcoinTxValue): 150,000 - 0 = +150,000 sats = +0.0015 BTC
export const mockTaprootOnlyReceiveTx: BitcoinTx = {
  txid: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
  version: 2,
  locktime: 0,
  vin: [
    {
      txid: 'dddd1111eeee2222ffff3333aaaa4444bbbb5555cccc6666dddd7777eeee8888',
      vout: 0,
      prevout: {
        scriptpubkey: '0014e8df018c7e28ba89d305f73ac3f756cc8615e9fe',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 e8df018c7e28ba89d305f73ac3f756cc8615e9fe',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        value: 151000,
      },
      scriptsig: '',
      scriptsig_asm: '',
      witness: [
        '304402207f8c4e3c6c0c0e5a9b0b2a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e01',
        '03a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      ],
      is_coinbase: false,
      sequence: 4294967295,
    },
  ],
  vout: [
    {
      scriptpubkey: '51200be4124bf11363a7294b2412d27bdce30c3800bc6b84e5a46965b9cddb23e492',
      scriptpubkey_asm:
        'OP_PUSHNUM_1 OP_PUSHBYTES_32 0be4124bf11363a7294b2412d27bdce30c3800bc6b84e5a46965b9cddb23e492',
      scriptpubkey_type: 'v1_p2tr',
      scriptpubkey_address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
      value: 150000,
    },
  ],
  size: 200,
  weight: 560,
  fee: 1000,
  status: {
    confirmed: true,
    block_height: 810700,
    block_hash: '00000000000000000004b8d5c2f59e87d6b48013276b381267c8b9e83g9915c8',
    block_time: 1696500000,
  },
};

export async function mockTaprootOnlyBitcoinTransactions(page: Page, txs: BitcoinTx[]) {
  await page.unroute('**/leather.mempool.space/api/address/*/txs');
  await page.unroute(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS}/txs`
  );

  await page.route('**/leather.mempool.space/api/address/*/txs', route =>
    route.fulfill({ json: [] })
  );

  await page.route(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS}/txs`,
    route => route.fulfill({ json: [] })
  );

  await page.route(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_TAPROOT_ADDRESS}/txs`,
    route => route.fulfill({ json: txs })
  );
}
