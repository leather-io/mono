import { describe, expect, test } from 'vitest';

import { sbtcAssetId } from './sip10';
import { externalStacksAddress, fundedBalanceChanges, fundedPrincipalTransactions } from './stacks';

const address = 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW';

function readTxIds() {
  return fundedPrincipalTransactions(address).map(result => result.transaction.tx_id);
}

describe('funded Stacks transactions', () => {
  test('lists the sBTC receive, the STX send and the STX receive, newest first', () => {
    const results = fundedPrincipalTransactions(address);
    const times = results.map(result => result.transaction.block.time);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
    expect(results).toMatchObject([
      {
        transaction: {
          type: 'contract_call',
          sender: { address: externalStacksAddress },
          contract_call: { function_name: 'transfer' },
        },
        involvement: 'affected',
        balance_changes: { stx: { net: '0' } },
        affected_balances: { stx: false, ft: true, nft: false },
      },
      {
        transaction: {
          type: 'token_transfer',
          sender: { address, nonce: 0 },
          fee_rate: '431963',
          token_transfer: { recipient: externalStacksAddress, amount: '1000000' },
        },
        involvement: 'sender',
        balance_changes: { stx: { net: '-1431963' } },
        affected_balances: { stx: true, ft: false, nft: false },
      },
      {
        transaction: {
          type: 'token_transfer',
          sender: { address: externalStacksAddress },
          token_transfer: { recipient: address, amount: '15000000' },
        },
        involvement: 'affected',
        balance_changes: { stx: { net: '15000000' } },
        affected_balances: { stx: true, ft: false, nft: false },
      },
    ]);
  });

  test('answers balance changes only for the requested transactions', () => {
    const [sbtcTxid = '', sendTxid = ''] = readTxIds();
    expect(fundedBalanceChanges([sendTxid])).toEqual([]);
    expect(fundedBalanceChanges([sbtcTxid, sendTxid])).toEqual([
      {
        tx_id: sbtcTxid,
        asset: { type: 'ft', identifier: sbtcAssetId },
        balance_change: { sent: '0', received: '10000000', net: '10000000' },
      },
    ]);
  });
});
