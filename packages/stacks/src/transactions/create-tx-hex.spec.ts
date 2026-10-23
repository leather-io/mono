import { hexToBytes } from '@stacks/common';
import { AuthType, deserializeTransaction } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { createTransferSip10TxHex } from './create-tx-hex';

const signer = {
  address: 'SP2BM6AQSMQ04CX8KDE62QBFVZTDZ2ZX80GZJSBZ4',
  publicKey: hexToBytes('8721c6a5237f5e8d361161a7855aa56885a3e19e2ea6ee268fb14eabc5e2ed9001'),
};

const transfer = {
  signer,
  assetId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
  recipient: 'SP1TFTBQZANNVWABSFDRM0YWPJQDP27WZ8SR0NE3S',
  amount: 1000,
  nonce: 1,
};

describe(createTransferSip10TxHex.name, () => {
  it('builds a standard transaction by default', async () => {
    const txHex = await createTransferSip10TxHex({
      ...transfer,
      fee: createMoney(new BigNumber(3000), 'STX'),
    });

    const tx = deserializeTransaction(txHex);
    expect(tx.auth.authType).toEqual(AuthType.Standard);
    expect(tx.auth.spendingCondition.fee).toBe(BigInt('3000'));
  });

  it('builds a sponsored transaction with a zero origin fee when sponsored', async () => {
    const txHex = await createTransferSip10TxHex({
      ...transfer,
      fee: createMoney(new BigNumber(0), 'STX'),
      sponsored: true,
    });

    const tx = deserializeTransaction(txHex);
    expect(tx.auth.authType).toEqual(AuthType.Sponsored);
    expect(tx.auth.spendingCondition.fee).toBe(BigInt('0'));
  });
});
