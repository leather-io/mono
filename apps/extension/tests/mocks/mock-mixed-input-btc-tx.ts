import type { Page } from '@playwright/test';

import type { BitcoinTx } from '@leather.io/models';

import { TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, TEST_ACCOUNT_1_TAPROOT_ADDRESS } from './constants';

// Transaction with both native segwit and taproot inputs from the test account.
// Inputs:  300,000 (native segwit) + 200,000 (taproot) = 500,000 sats
// Outputs: 400,000 (recipient) + 99,000 (change) = 499,000 sats
// Fee:     1,000 sats
// Net outgoing (getBitcoinTxValue): 99,000 - 500,000 = -401,000 sats = -0.00401 BTC
export const mockMixedInputBtcTx: BitcoinTx = {
  txid: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
  version: 2,
  locktime: 0,
  vin: [
    {
      txid: 'aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666aaaa7777bbbb8888',
      vout: 0,
      prevout: {
        scriptpubkey: '0014a45ed156e77d9df111dfb99409beda635695b4b1',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 a45ed156e77d9df111dfb99409beda635695b4b1',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
        value: 300000,
      },
      scriptsig: '',
      scriptsig_asm: '',
      witness: [
        '3045022100bb1fbaf38d346877383c1ad5a6e255cd5fea4e68e7bd4687dc5e1f9f96e98118022019d8990149b81242c79b600b7e37362055a7413acda4cd553ba0b61564a5284901',
        '02e442dd5aa06eafd0fccd76971f4035b05bee611470153f7f1e0e70f81df0e130',
      ],
      is_coinbase: false,
      sequence: 4294967295,
    },
    {
      txid: 'bbbb1111cccc2222dddd3333eeee4444ffff5555aaaa6666bbbb7777cccc8888',
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
        '839f120447cb677dbd06a2a9b69134be8d38918ee5a2e8ba3e6a3079315401a58b240edcefbbb1b16b5c036194c7c7ceb21d1f647ee352092115f1a8bb56ba53',
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
      value: 400000,
    },
    {
      scriptpubkey: '0014a45ed156e77d9df111dfb99409beda635695b4b1',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 a45ed156e77d9df111dfb99409beda635695b4b1',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      value: 99000,
    },
  ],
  size: 330,
  weight: 792,
  fee: 1000,
  status: {
    confirmed: true,
    block_height: 810500,
    block_hash: '00000000000000000002a7c4c1e48d76c5a37902165a270156b7a8d72f8804b6',
    block_time: 1696300000,
  },
};

export async function mockMixedInputBitcoinTransactions(page: Page) {
  await page.unroute('**/leather.mempool.space/api/address/*/txs');
  await page.unroute(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS}/txs`
  );

  await page.route('**/leather.mempool.space/api/address/*/txs', route =>
    route.fulfill({ json: [] })
  );

  await page.route(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS}/txs`,
    route => route.fulfill({ json: [mockMixedInputBtcTx] })
  );

  await page.route(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_TAPROOT_ADDRESS}/txs`,
    route => route.fulfill({ json: [mockMixedInputBtcTx] })
  );
}
