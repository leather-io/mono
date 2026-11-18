import { type TransactionEvent } from '@stacks/stacks-blockchain-api-types';

import { stxAsset } from '@leather.io/constants';
import {
  type AccountAddresses,
  ActivityLevels,
  CryptoAssetCategories,
  OnChainActivityStatuses,
  OnChainActivityTypes,
} from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import {
  createActivityContractCallTx,
  createActivityMempoolTokenTransferTx,
  createActivitySip10Asset,
  createActivitySmartContractLogEvent,
  createActivitySmartContractTx,
  createActivityTokenTransferTx,
  removeActivityBlockTimes,
} from '../test/activity-fixtures';
import {
  createTestPrincipalMempoolContractCallTx,
  createTestPrincipalMempoolSmartContractTx,
  createTestPrincipalMempoolTokenTransferTx,
} from '../test/transactions-fixtures';
import { type StacksAssetTransferWithInfo } from './stacks-asset-transfer.utils';
import { getStacksTxByStatus } from './stacks-mempool-tx.utils';
import {
  getEventsByTxId,
  mapContractCallActivity,
  mapPendingStacksTxActivity,
  mapSmartContractActivity,
  mapStacksTxBlockHeight,
  mapStacksTxBlockTime,
  mapStacksTxFee,
  mapStacksTxStatus,
  mapTokenTransferActivity,
  mapTxAssetTransfersToActivity,
} from './stacks-tx-activity.utils';

describe('mapTokenTransferActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  const commonTxProps = {
    tx_id: 'tx123',
    tx_status: 'success' as const,
    token_transfer: {
      amount: '1000',
      memo: '',
    },
  };

  it('maps send activity when sender matches account', () => {
    const tx = removeActivityBlockTimes(
      createActivityTokenTransferTx({
        ...commonTxProps,
        sender_address: 'ST123',
        token_transfer: {
          ...commonTxProps.token_transfer,
          recipient_address: 'ST456',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapTokenTransferActivity(tx, account);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        receivers: ['ST456'],
        asset: stxAsset,
        amount: initBigNumber('1000'),
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined, // No block time in test tx
        level: ActivityLevels.account,
      },
    ]);
  });

  it('maps receive activity when recipient matches account', () => {
    const tx = removeActivityBlockTimes(
      createActivityTokenTransferTx({
        ...commonTxProps,
        sender_address: 'ST456',
        token_transfer: {
          ...commonTxProps.token_transfer,
          recipient_address: 'ST123',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapTokenTransferActivity(tx, account);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.receiveAsset,
        senders: ['ST456'],
        asset: stxAsset,
        amount: initBigNumber('1000'),
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });
});

describe('mapSmartContractActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  it('adds deploy activity when sender matches account', () => {
    const tx = removeActivityBlockTimes(
      createActivitySmartContractTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        smart_contract: {
          contract_id: 'ST123.my-contract',
          source_code: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapSmartContractActivity(tx, account, []);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.deploySmartContract,
        contractId: 'ST123.my-contract',
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('includes asset transfers if present', () => {
    const tx = removeActivityBlockTimes(
      createActivitySmartContractTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        smart_contract: {
          contract_id: 'ST123.my-contract',
          source_code: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const transfers: StacksAssetTransferWithInfo[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
    ];

    const result = mapSmartContractActivity(tx, account, transfers);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      type: OnChainActivityTypes.sendAsset,
      asset: stxAsset,
      amount: initBigNumber('1000'),
      receivers: ['ST456'],
      account: account.id,
      txid: 'tx123',
      status: OnChainActivityStatuses.success,
      timestamp: undefined,
      level: ActivityLevels.account,
    });
  });
});

describe('mapContractCallActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  it('maps execute activity when no transfers present', () => {
    const tx = removeActivityBlockTimes(
      createActivityContractCallTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        contract_call: {
          contract_id: 'ST456.contract',
          function_name: 'transfer',
          function_signature: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const result = mapContractCallActivity(tx, account, []);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.executeSmartContract,
        contractId: 'ST456.contract',
        functionName: 'transfer',
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('only maps transfers if present', () => {
    const tx = removeActivityBlockTimes(
      createActivityContractCallTx({
        tx_id: 'tx123',
        tx_status: 'success',
        sender_address: 'ST123',
        contract_call: {
          contract_id: 'ST456.contract',
          function_name: 'transfer',
          function_signature: '',
        },
      }),
      ['block_time', 'burn_block_time']
    );

    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
    ];

    const result = mapContractCallActivity(tx, account, transfers);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      type: OnChainActivityTypes.sendAsset,
      asset: stxAsset,
      amount: initBigNumber('1000'),
      receivers: ['ST456'],
      account: account.id,
      txid: 'tx123',
      status: OnChainActivityStatuses.success,
      timestamp: undefined,
      level: ActivityLevels.account,
    });
  });
});

describe('mapTxAssetTransfersToActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: {
      stxAddress: 'ST123',
    },
  };

  const tx = removeActivityBlockTimes(
    createActivityTokenTransferTx({
      tx_id: 'tx123',
      tx_status: 'success',
    }),
    ['block_time', 'burn_block_time']
  );
  const tokenXyz = createActivitySip10Asset({ assetId: 'ST000.token::xyz' });

  it('maps simple asset sends and aggregates amounts and receivers', () => {
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST789',
        tokenValue: '2000',
      },
    ];

    expect(mapTxAssetTransfersToActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        asset: stxAsset,
        amount: initBigNumber('3000'),
        receivers: ['ST456', 'ST789'],
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('maps simple asset receives and aggregates amounts and senders', () => {
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        asset: tokenXyz,
        sender: 'ST456',
        receiver: 'ST123',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        asset: tokenXyz,
        sender: 'ST789',
        receiver: 'ST123',
        tokenValue: '2000',
      },
    ];

    expect(mapTxAssetTransfersToActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.receiveAsset,
        asset: tokenXyz,
        amount: initBigNumber('3000'),
        senders: ['ST456', 'ST789'],
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('maps 1 send transfer and 1 receive transfer to swap activity', () => {
    const transfers: StacksAssetTransferWithInfo[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        asset: tokenXyz,
        sender: 'ST456',
        receiver: 'ST123',
        tokenValue: '2000',
      },
    ];

    const result = mapTxAssetTransfersToActivity(tx, account, transfers);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.swapAssets,
        fromAsset: stxAsset,
        fromAmount: initBigNumber('1000'),
        toAsset: tokenXyz,
        toAmount: initBigNumber('2000'),
        account: account.id,
        txid: 'tx123',
        status: OnChainActivityStatuses.success,
        timestamp: undefined,
        level: ActivityLevels.account,
      },
    ]);
  });

  it('ignores complex transfers with >1 asset sent or received', () => {
    const transfers: StacksAssetTransferWithInfo[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'TOKEN1',
        asset: createActivitySip10Asset({ name: 'Token1' }),
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '2000',
      },
    ];

    const result = mapTxAssetTransfersToActivity(tx, account, transfers);

    expect(result).toEqual([]);
  });
});

describe('getStacksTxByStatus', () => {
  it('returns false for success status', () => {
    expect(
      getStacksTxByStatus(createActivityTokenTransferTx({ tx_status: 'success' })).mempoolTx
    ).toBeUndefined();
  });

  it('returns false for abort_by_post_condition', () => {
    expect(
      getStacksTxByStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_post_condition' }))
        .mempoolTx
    ).toBeUndefined();
  });

  it('returns false for abort_by_response', () => {
    expect(
      getStacksTxByStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_response' }))
        .mempoolTx
    ).toBeUndefined();
  });

  it('returns true for pending status', () => {
    expect(
      getStacksTxByStatus(createActivityMempoolTokenTransferTx({ tx_status: 'pending' })).mempoolTx
    ).toBeDefined();
  });
});

describe('mapStacksTxStatus', () => {
  it('maps success', () => {
    expect(mapStacksTxStatus(createActivityTokenTransferTx({ tx_status: 'success' }))).toBe(
      'success'
    );
  });

  it('maps pending', () => {
    expect(mapStacksTxStatus(createActivityMempoolTokenTransferTx({ tx_status: 'pending' }))).toBe(
      'pending'
    );
  });

  it('maps abort statuses to failed', () => {
    expect(
      mapStacksTxStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_response' }))
    ).toBe('failed');
    expect(
      mapStacksTxStatus(createActivityTokenTransferTx({ tx_status: 'abort_by_post_condition' }))
    ).toBe('failed');
  });
});

describe('mapStacksTxBlockTime', () => {
  it('returns receipt_time for mempool tx', () => {
    const tx = createActivityMempoolTokenTransferTx({
      tx_status: 'pending',
      receipt_time: 1700000001,
    });
    expect(mapStacksTxBlockTime(tx)).toBe(1700000001);
  });

  it('returns block_time for confirmed tx', () => {
    const tx = createActivityTokenTransferTx({
      tx_status: 'success',
      block_time: 1700000000,
      burn_block_time: 1699999999,
    });
    expect(mapStacksTxBlockTime(tx)).toBe(1700000000);
  });

  it('falls back to burn_block_time when block_time is missing', () => {
    const tx = removeActivityBlockTimes(
      createActivityTokenTransferTx({
        tx_status: 'success',
        burn_block_time: 1699999999,
      }),
      ['block_time']
    );
    expect(mapStacksTxBlockTime(tx)).toBe(1699999999);
  });
});

describe('mapStacksTxBlockHeight', () => {
  it('returns block_height for confirmed tx', () => {
    const tx = createActivityTokenTransferTx({ tx_status: 'success', block_height: 500 });
    expect(mapStacksTxBlockHeight(tx)).toBe(500);
  });

  it('returns undefined for mempool tx', () => {
    const tx = createActivityMempoolTokenTransferTx({ tx_status: 'pending' });
    expect(mapStacksTxBlockHeight(tx)).toBeUndefined();
  });
});

describe('mapStacksTxFee', () => {
  it('returns fee_rate', () => {
    expect(mapStacksTxFee(createActivityTokenTransferTx({ fee_rate: '2500' }))).toBe('2500');
  });
});

describe('getEventsByTxId', () => {
  it('groups events by tx_id', () => {
    const events: TransactionEvent[] = [
      createActivitySmartContractLogEvent({ tx_id: '0xaaa', event_index: 0 }),
      createActivitySmartContractLogEvent({ tx_id: '0xbbb', event_index: 0 }),
      createActivitySmartContractLogEvent({ tx_id: '0xaaa', event_index: 1 }),
    ];

    const map = getEventsByTxId(events);

    expect(map.size).toBe(2);
    expect(map.get('0xaaa')).toHaveLength(2);
    expect(map.get('0xbbb')).toHaveLength(1);
  });

  it('returns empty map for empty events', () => {
    expect(getEventsByTxId([])).toEqual(new Map());
  });
});

describe('mapPendingStacksTxActivity', () => {
  const account: AccountAddresses = {
    id: { fingerprint: 'xyz', accountIndex: 0 },
    stacks: { stxAddress: 'ST123' },
  };
  const pendingProps = {
    level: ActivityLevels.account,
    account: account.id,
    status: OnChainActivityStatuses.pending,
  };

  it('maps a pending stx transfer sent by the account to a send activity', () => {
    const tx = createTestPrincipalMempoolTokenTransferTx({
      tx_id: '0xsend',
      sender: { address: 'ST123', nonce: 1 },
      receipt_time: 1_700_000_000,
      token_transfer: { recipient: 'ST456', amount: '1000', memo: null },
    });
    expect(mapPendingStacksTxActivity(tx, account)).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        receivers: ['ST456'],
        asset: stxAsset,
        amount: initBigNumber(1000),
        timestamp: 1_700_000_000,
        txid: '0xsend',
        ...pendingProps,
      },
    ]);
  });

  it('maps a pending stx transfer to the account to a receive activity', () => {
    const tx = createTestPrincipalMempoolTokenTransferTx({
      tx_id: '0xreceive',
      sender: { address: 'ST456', nonce: 1 },
      receipt_time: 1_700_000_000,
      token_transfer: { recipient: 'ST123', amount: '2000', memo: null },
    });
    expect(mapPendingStacksTxActivity(tx, account)).toEqual([
      {
        type: OnChainActivityTypes.receiveAsset,
        senders: ['ST456'],
        asset: stxAsset,
        amount: initBigNumber(2000),
        timestamp: 1_700_000_000,
        txid: '0xreceive',
        ...pendingProps,
      },
    ]);
  });

  it('maps a pending contract call sent by the account to an execute activity', () => {
    const tx = createTestPrincipalMempoolContractCallTx({
      tx_id: '0xcall',
      sender: { address: 'ST123', nonce: 2 },
      receipt_time: 1_700_000_000,
      contract_call: { contract_id: 'ST1.contract', function_name: 'transfer' },
    });
    expect(mapPendingStacksTxActivity(tx, account)).toEqual([
      {
        type: OnChainActivityTypes.executeSmartContract,
        contractId: 'ST1.contract',
        functionName: 'transfer',
        timestamp: 1_700_000_000,
        txid: '0xcall',
        ...pendingProps,
      },
    ]);
  });

  it('maps a pending contract deploy sent by the account to a deploy activity', () => {
    const tx = createTestPrincipalMempoolSmartContractTx({
      tx_id: '0xdeploy',
      sender: { address: 'ST123', nonce: 3 },
      receipt_time: 1_700_000_000,
      smart_contract: { contract_id: 'ST123.my-contract', clarity_version: 3 },
    });
    expect(mapPendingStacksTxActivity(tx, account)).toEqual([
      {
        type: OnChainActivityTypes.deploySmartContract,
        contractId: 'ST123.my-contract',
        timestamp: 1_700_000_000,
        txid: '0xdeploy',
        ...pendingProps,
      },
    ]);
  });

  it('maps a pending contract call with an outgoing token transfer to a send activity', () => {
    const token = createActivitySip10Asset({ assetId: 'ST000.token::xyz' });
    const tx = createTestPrincipalMempoolContractCallTx({
      tx_id: '0xsip10',
      sender: { address: 'ST123', nonce: 2 },
      receipt_time: 1_700_000_000,
    });
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        asset: token,
        sender: 'ST123',
        tokenValue: '500',
      },
    ];
    expect(mapPendingStacksTxActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        asset: token,
        amount: initBigNumber(500),
        receivers: [],
        timestamp: 1_700_000_000,
        txid: '0xsip10',
        ...pendingProps,
      },
    ]);
  });

  it('maps a pending contract deploy with transfers to transfer and deploy activities', () => {
    const tx = createTestPrincipalMempoolSmartContractTx({
      tx_id: '0xdeploywithstx',
      sender: { address: 'ST123', nonce: 3 },
      receipt_time: 1_700_000_000,
      smart_contract: { contract_id: 'ST123.my-contract', clarity_version: 3 },
    });
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        asset: stxAsset,
        sender: 'ST123',
        tokenValue: '1000',
      },
    ];
    expect(mapPendingStacksTxActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        asset: stxAsset,
        amount: initBigNumber(1000),
        receivers: [],
        timestamp: 1_700_000_000,
        txid: '0xdeploywithstx',
        ...pendingProps,
      },
      {
        type: OnChainActivityTypes.deploySmartContract,
        contractId: 'ST123.my-contract',
        timestamp: 1_700_000_000,
        txid: '0xdeploywithstx',
        ...pendingProps,
      },
    ]);
  });

  it('ignores pending contract calls the account did not send', () => {
    const tx = createTestPrincipalMempoolContractCallTx({
      sender: { address: 'ST456', nonce: 2 },
    });
    expect(mapPendingStacksTxActivity(tx, account)).toEqual([]);
  });
});
