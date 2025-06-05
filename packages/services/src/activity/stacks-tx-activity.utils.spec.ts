import {
  ContractCallTransaction,
  SmartContractTransaction,
  TokenTransferTransaction,
} from '@stacks/stacks-blockchain-api-types';

import { stxCryptoAsset } from '@leather.io/constants';
import {
  AccountAddresses,
  ActivityLevels,
  CryptoAssetCategories,
  OnChainActivityStatuses,
  OnChainActivityTypes,
} from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { HiroStacksTransaction } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { StacksAssetTransferWithInfo } from './stacks-asset-transfer.utils';
import {
  mapContractCallActivity,
  mapSmartContractActivity,
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
    tx_status: 'success',
    token_transfer: {
      amount: '1000',
    },
  };

  it('maps send activity when sender matches account', () => {
    const tx = {
      ...commonTxProps,
      sender_address: 'ST123',
      token_transfer: {
        ...commonTxProps.token_transfer,
        recipient_address: 'ST456',
      },
    } as TokenTransferTransaction;

    const result = mapTokenTransferActivity(tx, account);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        receivers: ['ST456'],
        asset: stxCryptoAsset,
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
    const tx = {
      ...commonTxProps,
      sender_address: 'ST456',
      token_transfer: {
        ...commonTxProps.token_transfer,
        recipient_address: 'ST123',
      },
    } as TokenTransferTransaction;

    const result = mapTokenTransferActivity(tx, account);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.receiveAsset,
        senders: ['ST456'],
        asset: stxCryptoAsset,
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
    const tx = {
      tx_id: 'tx123',
      tx_status: 'success',
      sender_address: 'ST123',
      smart_contract: {
        contract_id: 'ST123.my-contract',
      },
    } as SmartContractTransaction;

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
    const tx = {
      tx_id: 'tx123',
      tx_status: 'success',
      sender_address: 'ST123',
      smart_contract: {
        contract_id: 'ST123.my-contract',
      },
    } as SmartContractTransaction;

    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        assetInfo: stxCryptoAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
    ];

    const result = mapSmartContractActivity(tx, account, transfers);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      type: OnChainActivityTypes.sendAsset,
      asset: stxCryptoAsset,
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
    const tx = {
      tx_id: 'tx123',
      tx_status: 'success',
      sender_address: 'ST123',
      contract_call: {
        contract_id: 'ST456.contract',
        function_name: 'transfer',
      },
    } as ContractCallTransaction;

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
    const tx = {
      tx_id: 'tx123',
      tx_status: 'success',
      sender_address: 'ST123',
      contract_call: {
        contract_id: 'ST456.contract',
        function_name: 'transfer',
      },
    } as ContractCallTransaction;

    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        assetInfo: stxCryptoAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
    ];

    const result = mapContractCallActivity(tx, account, transfers);

    expect(result).toHaveLength(1);
    expect(result).toContainEqual({
      type: OnChainActivityTypes.sendAsset,
      asset: stxCryptoAsset,
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

  const tx = {
    tx_id: 'tx123',
    tx_status: 'success',
  } as HiroStacksTransaction;

  it('maps simple asset sends and aggregates amounts and receivers', () => {
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        assetInfo: stxCryptoAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        assetInfo: stxCryptoAsset,
        sender: 'ST123',
        receiver: 'ST789',
        tokenValue: '2000',
      },
    ];

    expect(mapTxAssetTransfersToActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.sendAsset,
        asset: stxCryptoAsset,
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
        assetInfo: { assetId: 'ST000.token::xyz' },
        sender: 'ST456',
        receiver: 'ST123',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        assetInfo: { assetId: 'ST000.token::xyz' },
        sender: 'ST789',
        receiver: 'ST123',
        tokenValue: '2000',
      },
    ] as StacksAssetTransferWithInfo[];

    expect(mapTxAssetTransfersToActivity(tx, account, transfers)).toEqual([
      {
        type: OnChainActivityTypes.receiveAsset,
        asset: { assetId: 'ST000.token::xyz' },
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
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        assetInfo: stxCryptoAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST000.token::xyz',
        assetInfo: { assetId: 'ST000.token::xyz' },
        sender: 'ST456',
        receiver: 'ST123',
        tokenValue: '2000',
      },
    ] as StacksAssetTransferWithInfo[];

    const result = mapTxAssetTransfersToActivity(tx, account, transfers);

    expect(result).toEqual([
      {
        type: OnChainActivityTypes.swapAssets,
        fromAsset: stxCryptoAsset,
        fromAmount: initBigNumber('1000'),
        toAsset: { assetId: 'ST000.token::xyz' },
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
    const transfers = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        assetInfo: stxCryptoAsset,
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1000',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'TOKEN1',
        assetInfo: { name: 'Token1' },
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '2000',
      },
    ] as StacksAssetTransferWithInfo[];

    const result = mapTxAssetTransfersToActivity(tx, account, transfers);

    expect(result).toEqual([]);
  });
});
