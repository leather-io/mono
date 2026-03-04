import type { Page } from '@playwright/test';

import type { BitcoinTx } from '@leather.io/models';

import { TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, TEST_ACCOUNT_1_TAPROOT_ADDRESS } from './constants';

export const mockBitcoinTestnetAddress = 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8';

// multiple inputs and outputs
export const mockPendingTxs1: BitcoinTx[] = [
  {
    txid: '7438bd24579108a85fbf77756e7b9c87238b947dd0f858f6e30bad4f4d6d557a',
    version: 2,
    locktime: 0,
    vin: [
      {
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        prevout: {
          scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
          value: 10000,
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
        txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
        vout: 0,
        prevout: {
          scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
          value: 10000,
        },
        scriptsig: '',
        scriptsig_asm: '',
        witness: [
          '3045022100827c37bd0c552be4de60d5bbd3d9bdd8287ff81ff18291d1b53a7e11dd7970b802202039d21822ad277ad566fefa8a9d64911303ced0826b5e0c938b1e239308cac401',
          '02e442dd5aa06eafd0fccd76971f4035b05bee611470153f7f1e0e70f81df0e130',
        ],
        is_coinbase: false,
        sequence: 4294967295,
      },
    ],
    vout: [
      {
        scriptpubkey: '00148027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 8027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
        value: 10000,
      },
      {
        scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
        value: 5835,
      },
    ],
    size: 372,
    weight: 834,
    fee: 4165,
    status: {
      confirmed: false,
    },
  },
];

// multiple transactions
export const mockPendingTxs2: BitcoinTx[] = [
  {
    txid: '7438bd24579108a85fbf77756e7b9c87238b947dd0f858f6e30bad4f4d6d557a',
    version: 2,
    locktime: 0,
    vin: [
      {
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        prevout: {
          scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
          value: 10000,
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
        txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
        vout: 0,
        prevout: {
          scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
          value: 10000,
        },
        scriptsig: '',
        scriptsig_asm: '',
        witness: [
          '3045022100827c37bd0c552be4de60d5bbd3d9bdd8287ff81ff18291d1b53a7e11dd7970b802202039d21822ad277ad566fefa8a9d64911303ced0826b5e0c938b1e239308cac401',
          '02e442dd5aa06eafd0fccd76971f4035b05bee611470153f7f1e0e70f81df0e130',
        ],
        is_coinbase: false,
        sequence: 4294967295,
      },
    ],
    vout: [
      {
        scriptpubkey: '00148027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 8027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
        value: 10000,
      },
      {
        scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
        value: 5835,
      },
    ],
    size: 372,
    weight: 834,
    fee: 4165,
    status: {
      confirmed: false,
    },
  },
  {
    txid: '7438bd24579108a85fbf77756e7b9c87238b947dd0f858f6e30bad4f4d6d557a',
    version: 2,
    locktime: 0,
    vin: [
      {
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        prevout: {
          scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
          value: 10000,
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
        txid: 'c715ea469c8d794f6dd7e0043148631f69d411c428ef0ab2b04e4528ffe8319f',
        vout: 0,
        prevout: {
          scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
          value: 10000,
        },
        scriptsig: '',
        scriptsig_asm: '',
        witness: [
          '3045022100827c37bd0c552be4de60d5bbd3d9bdd8287ff81ff18291d1b53a7e11dd7970b802202039d21822ad277ad566fefa8a9d64911303ced0826b5e0c938b1e239308cac401',
          '02e442dd5aa06eafd0fccd76971f4035b05bee611470153f7f1e0e70f81df0e130',
        ],
        is_coinbase: false,
        sequence: 4294967295,
      },
    ],
    vout: [
      {
        scriptpubkey: '00148027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 8027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
        value: 10000,
      },
      {
        scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
        value: 5835,
      },
    ],
    size: 372,
    weight: 834,
    fee: 4165,
    status: {
      confirmed: false,
    },
  },
];

// one input and many outputs
export const mockPendingTxs3: BitcoinTx[] = [
  {
    txid: '7438bd24579108a85fbf77756e7b9c87238b947dd0f858f6e30bad4f4d6d557a',
    version: 2,
    locktime: 0,
    vin: [
      {
        txid: '8192e8e20088c5f052fc7351b86b8f60a9454937860b281227e53e19f3e9c3f6',
        vout: 0,
        prevout: {
          scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
          scriptpubkey_type: 'v0_p2wpkh',
          scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
          value: 20000,
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
    ],
    vout: [
      {
        scriptpubkey: '00148027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 8027825ee06ad337f9716df8137a1b651163c5b0',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qsqncyhhqdtfn07t3dhupx7smv5gk83ds6k0gfa',
        value: 10000,
      },
      {
        scriptpubkey: '00143128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 3128328ffb0e0c8704aa32a85a822843d5a256cd',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'tb1qxy5r9rlmpcxgwp92x2594q3gg026y4kdv2rsl8',
        value: 5835,
      },
    ],
    size: 372,
    weight: 834,
    fee: 4165,
    status: {
      confirmed: false,
    },
  },
];

// Mainnet pending native segwit outbound tx for RBF tests
export const mockPendingNativeSegwitBtcTx: BitcoinTx = {
  txid: 'aabb1122334455667788990011223344aabb1122334455667788990011223344',
  version: 2,
  locktime: 0,
  vin: [
    {
      txid: 'dd11ee22ff33aa44bb55cc66dd77ee88ff99aa00bb11cc22dd33ee44ff55aa66',
      vout: 0,
      prevout: {
        scriptpubkey: '0014a45ed156e77d9df111dfb99409beda635695b4b1',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 a45ed156e77d9df111dfb99409beda635695b4b1',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
        value: 20000,
      },
      scriptsig: '',
      scriptsig_asm: '',
      witness: [
        '3045022100bb1fbaf38d346877383c1ad5a6e255cd5fea4e68e7bd4687dc5e1f9f96e98118022019d8990149b81242c79b600b7e37362055a7413acda4cd553ba0b61564a5284901',
        '02e442dd5aa06eafd0fccd76971f4035b05bee611470153f7f1e0e70f81df0e130',
      ],
      is_coinbase: false,
      sequence: 4294967293,
    },
  ],
  vout: [
    {
      scriptpubkey: '0014751e76e8199196d454941c45d1b3a323f1433bd6',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 751e76e8199196d454941c45d1b3a323f1433bd6',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      value: 10000,
    },
    {
      scriptpubkey: '0014a45ed156e77d9df111dfb99409beda635695b4b1',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 a45ed156e77d9df111dfb99409beda635695b4b1',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      value: 8000,
    },
  ],
  size: 222,
  weight: 561,
  fee: 2000,
  status: {
    confirmed: false,
  },
};

// Mainnet pending mixed-input outbound tx for RBF tests (taproot + native segwit)
export const mockPendingMixedInputBtcTx: BitcoinTx = {
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
      sequence: 4294967293,
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
      sequence: 4294967293,
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
    confirmed: false,
  },
};

// Mainnet pending inbound tx (from external to test account)
export const mockPendingInboundBtcTx: BitcoinTx = {
  txid: 'ccdd1122334455667788990011223344aabb1122334455667788990011223344',
  version: 2,
  locktime: 0,
  vin: [
    {
      txid: 'ee11ff22aa33bb44cc55dd66ee77ff88aa99bb00cc11dd22ee33ff44aa55bb66',
      vout: 0,
      prevout: {
        scriptpubkey: '0014751e76e8199196d454941c45d1b3a323f1433bd6',
        scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 751e76e8199196d454941c45d1b3a323f1433bd6',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        value: 50000,
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
  ],
  vout: [
    {
      scriptpubkey: '0014a45ed156e77d9df111dfb99409beda635695b4b1',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 a45ed156e77d9df111dfb99409beda635695b4b1',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      value: 45000,
    },
    {
      scriptpubkey: '0014751e76e8199196d454941c45d1b3a323f1433bd6',
      scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 751e76e8199196d454941c45d1b3a323f1433bd6',
      scriptpubkey_type: 'v0_p2wpkh',
      scriptpubkey_address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      value: 3000,
    },
  ],
  size: 222,
  weight: 561,
  fee: 2000,
  status: {
    confirmed: false,
  },
};

export async function mockPendingBitcoinTransactions(page: Page, txs: BitcoinTx[]) {
  await page.unroute('**/leather.mempool.space/api/address/*/txs');

  await page.route('**/leather.mempool.space/api/address/*/txs', route =>
    route.fulfill({ json: [] })
  );

  await page.route(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS}/txs`,
    route => route.fulfill({ json: txs })
  );

  await page.route(
    `**/leather.mempool.space/api/address/${TEST_ACCOUNT_1_TAPROOT_ADDRESS}/txs`,
    route => route.fulfill({ json: txs })
  );
}

export async function mockBitcoinMainnetBroadcast(page: Page) {
  await page.route('**/leather.mempool.space/api/tx', route =>
    route.fulfill({
      body: 'aabb1122334455667788990011223344aabb1122334455667788990011223344',
    })
  );
}
