import { PostCondition } from '@stacks/stacks-blockchain-api-types';
import { BigNumber } from 'bignumber.js';

import { CryptoAssetCategories } from '@leather.io/models';

import {
  HiroStacksMempoolTransaction,
  HiroTransactionEvent,
} from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  StacksAssetTransfer,
  aggregateTransferReceivers,
  aggregateTransferSenders,
  getStacksAssetTransfers,
  mapTransferFromPostCondition,
  mapTransferFromTxEvent,
  sumAssetTransferAmounts,
} from './stacks-asset-transfer.utils';

describe(sumAssetTransferAmounts.name, () => {
  it('disallows summing multiple assets', () => {
    const multiAssetTransfers: StacksAssetTransfer[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token1',
        tokenValue: '100',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token2',
        tokenValue: '200',
      },
    ];
    expect(() => sumAssetTransferAmounts(multiAssetTransfers)).toThrow();
  });

  it('sums FT token values', () => {
    const transfers: StacksAssetTransfer[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token1',
        tokenValue: '100',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token1',
        tokenValue: '200',
      },
    ];

    const result = sumAssetTransferAmounts(transfers);
    expect(result).toEqual(new BigNumber(300));
  });

  it('ignores NFT tokenValue and counts amount as 1', () => {
    const nftTransfers: StacksAssetTransfer[] = [
      {
        assetCategory: CryptoAssetCategories.nft,
        assetId: 'nft1',
        tokenValue: '0x1234',
      },
      {
        assetCategory: CryptoAssetCategories.nft,
        assetId: 'nft1',
        tokenValue: '0x5678',
      },
    ];
    const result = sumAssetTransferAmounts(nftTransfers);
    expect(result).toEqual(new BigNumber(2));
  });
});

describe(aggregateTransferSenders.name, () => {
  it('returns list of unique senders', () => {
    const transfers: StacksAssetTransfer[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token1',
        sender: 'sender1',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token2',
        sender: 'sender1',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token3',
        sender: 'sender2',
      },
    ];
    const result = aggregateTransferSenders(transfers);
    expect(result).toEqual(['sender1', 'sender2']);
  });
});

describe(aggregateTransferReceivers.name, () => {
  it('returns list of unique receivers', () => {
    const transfers: StacksAssetTransfer[] = [
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token',
        receiver: 'receiver1',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token',
        receiver: 'receiver2',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'token1',
        receiver: 'receiver2',
      },
    ];
    const result = aggregateTransferReceivers(transfers);
    expect(result).toEqual(['receiver1', 'receiver2']);
  });
});

describe(mapTransferFromTxEvent.name, () => {
  it('maps stx_asset, fungible_token_asset, and non_fungible_token_asset events to asset transfers', () => {
    const stxEvent = {
      event_type: 'stx_asset',
      asset: {
        amount: '1000',
        sender: 'ST123',
        recipient: 'ST456',
      },
    } as HiroTransactionEvent;
    const ftEvent = {
      event_type: 'fungible_token_asset',
      asset: {
        asset_id: 'ST123.token::xyz',
        amount: '2000',
        sender: 'ST789',
        recipient: 'ST012',
      },
    } as HiroTransactionEvent;
    const nftEvent = {
      event_type: 'non_fungible_token_asset',
      asset: {
        asset_id: 'ST123.nft::xyz',
        value: { hex: '0x1234' },
        sender: 'ST345',
        recipient: 'ST678',
      },
    } as HiroTransactionEvent;

    expect(mapTransferFromTxEvent(stxEvent)).toEqual({
      assetCategory: CryptoAssetCategories.fungible,
      assetId: 'STX',
      sender: 'ST123',
      receiver: 'ST456',
      tokenValue: '1000',
    });
    expect(mapTransferFromTxEvent(ftEvent)).toEqual({
      assetCategory: CryptoAssetCategories.fungible,
      assetId: 'ST123.token::xyz',
      sender: 'ST789',
      receiver: 'ST012',
      tokenValue: '2000',
    });
    expect(mapTransferFromTxEvent(nftEvent)).toEqual({
      assetCategory: CryptoAssetCategories.nft,
      assetId: 'ST123.nft::xyz',
      sender: 'ST345',
      receiver: 'ST678',
      tokenValue: '0x1234',
    });
  });

  it('returns undefined for unrecognized event_type values', () => {
    const unrecognizedEvent = {
      event_type: 'smart_contract_log',
    } as HiroTransactionEvent;
    expect(mapTransferFromTxEvent(unrecognizedEvent)).toBe(undefined);
  });
});

describe(mapTransferFromPostCondition.name, () => {
  it('maps stx post condition to transfer', () => {
    const pc = {
      type: 'stx',
      principal: { type_id: 'principal_standard', address: 'ST123' },
      amount: '1000',
    } as PostCondition;
    expect(mapTransferFromPostCondition(pc)).toEqual({
      assetCategory: CryptoAssetCategories.fungible,
      assetId: 'STX',
      sender: 'ST123',
      tokenValue: '1000',
    });
  });

  it('maps fungible post condition to transfer', () => {
    const pc = {
      type: 'fungible',
      principal: { type_id: 'principal_standard', address: 'ST123' },
      amount: '1000',
      asset: {
        contract_address: 'ST456',
        contract_name: 'token',
        asset_name: 'xyz',
      },
    } as PostCondition;
    expect(mapTransferFromPostCondition(pc)).toEqual({
      assetCategory: CryptoAssetCategories.fungible,
      assetId: 'ST456.token::xyz',
      sender: 'ST123',
      tokenValue: '1000',
    });
  });

  it('maps non_fungible post condition to transfer', () => {
    const pc = {
      type: 'non_fungible',
      principal: { type_id: 'principal_standard', address: 'ST123' },
      asset: {
        contract_address: 'ST456',
        contract_name: 'some-nft',
        asset_name: 'xyz',
      },
      asset_value: {
        hex: '0x1234',
      },
    } as PostCondition;
    expect(mapTransferFromPostCondition(pc)).toEqual({
      assetCategory: CryptoAssetCategories.fungible,
      assetId: 'ST456.some-nft::xyz',
      sender: 'ST123',
      tokenValue: '0x1234',
    });
  });
});

describe(getStacksAssetTransfers.name, () => {
  it('maps stx, nft, and ft transfers from PCs when tx is pending', () => {
    const stxPc = {
      type: 'stx',
      principal: { type_id: 'principal_standard', address: 'ST123' },
      amount: '1000',
    } as PostCondition;

    const ftPc = {
      type: 'fungible',
      principal: { type_id: 'principal_standard', address: 'ST123' },
      amount: '1000',
      asset: {
        contract_address: 'ST456',
        contract_name: 'token',
        asset_name: 'xyz',
      },
    } as PostCondition;

    const nftPc = {
      type: 'non_fungible',
      principal: { type_id: 'principal_standard', address: 'ST123' },
      asset: {
        contract_address: 'ST789',
        contract_name: 'some-nft',
        asset_name: 'xyz',
      },
      asset_value: {
        hex: '0x1234',
      },
    } as PostCondition;

    const tx = {
      tx_status: 'pending',
      post_conditions: [stxPc, ftPc, nftPc],
    } as HiroStacksMempoolTransaction;

    const pendingTransfers = getStacksAssetTransfers(tx, []);

    expect(pendingTransfers.length).toBe(3);
    expect(pendingTransfers[0].assetId).toEqual('STX');
    expect(pendingTransfers[1].assetId).toEqual('ST456.token::xyz');
    expect(pendingTransfers[2].assetId).toEqual('ST789.some-nft::xyz');
  });

  it('maps non-zero amount stx & ft transfers from PCs and takes final amount from matching events', () => {
    const tx = {
      tx_status: 'success',
      post_conditions: [
        {
          type: 'stx',
          principal: { type_id: 'principal_standard', address: 'ST123' },
          amount: '1000',
        },
        {
          type: 'fungible',
          principal: { type_id: 'principal_standard', address: 'ST123' },
          amount: '2000',
          asset: {
            contract_address: 'ST456',
            contract_name: 'token-1',
            asset_name: 'TKN1',
          },
        },
        {
          type: 'fungible',
          principal: { type_id: 'principal_standard', address: 'ST123' },
          amount: '2000',
          asset: {
            contract_address: 'ST369',
            contract_name: 'token-2',
            asset_name: 'TKN2',
          },
        },
        {
          type: 'non_fungible',
          principal: { type_id: 'principal_standard', address: 'ST123' },
          asset: {
            contract_address: 'ST789',
            contract_name: 'nft',
            asset_name: 'abc',
          },
          asset_value: { hex: '0x1234' },
        },
      ],
    };

    const events = [
      {
        event_type: 'stx_asset',
        asset: {
          amount: '900',
          sender: 'ST123',
          recipient: 'ST456',
        },
      },
      {
        event_type: 'fungible_token_asset',
        asset: {
          amount: '1800',
          asset_id: 'ST456.token-1::TKN1',
          sender: 'ST123',
          recipient: 'ST456',
        },
      },
    ];

    const result = getStacksAssetTransfers(tx as any, events as any);

    expect(result).toEqual([
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '900',
      },
      {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'ST456.token-1::TKN1',
        sender: 'ST123',
        receiver: 'ST456',
        tokenValue: '1800',
      },
    ]);
  });
});
