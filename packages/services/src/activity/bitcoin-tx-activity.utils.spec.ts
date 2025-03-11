import {
  OnChainActivityStatuses,
  OnChainActivityTypes,
  ReceiveAssetActivity,
  SendAssetActivity,
} from '@leather.io/models';

import { LeatherApiBitcoinTransaction } from '../infrastructure/api/leather/leather-api.client';
import {
  mapBitcoinTxBlockTime,
  mapBitcoinTxStatus,
  mapBitcoinTxToActivity,
} from './bitcoin-tx-activity.utils';

describe(mapBitcoinTxBlockTime.name, () => {
  it('returns blocktime when time and height fields present', () => {
    const blockTime = mapBitcoinTxBlockTime({
      height: 123,
      time: 456,
    } as LeatherApiBitcoinTransaction);
    expect(blockTime).toBe(456);
  });
  it('defaults to current timestamp when no time or height', () => {
    const now = new Date().getTime();
    const blockTimeNoHeight = mapBitcoinTxBlockTime({
      time: 456,
    } as LeatherApiBitcoinTransaction);
    const blockTimeNoTime = mapBitcoinTxBlockTime({
      height: 456,
    } as LeatherApiBitcoinTransaction);
    const blockTimeNoHeightOrTime = mapBitcoinTxBlockTime({
      height: 456,
    } as LeatherApiBitcoinTransaction);
    expect(blockTimeNoHeight).toBeGreaterThanOrEqual(now);
    expect(blockTimeNoTime).toBeGreaterThanOrEqual(now);
    expect(blockTimeNoHeightOrTime).toBeGreaterThanOrEqual(now);
  });
});

describe(mapBitcoinTxStatus.name, () => {
  it('returns success if height field present, otherwise returns pending', () => {
    const statusWithBlockHeight = mapBitcoinTxStatus({
      height: 456,
    } as LeatherApiBitcoinTransaction);
    const statusNoBlockHeight = mapBitcoinTxStatus({} as LeatherApiBitcoinTransaction);
    expect(statusWithBlockHeight).toBe(OnChainActivityStatuses.success);
    expect(statusNoBlockHeight).toBe(OnChainActivityStatuses.pending);
  });
});

describe(mapBitcoinTxToActivity.name, () => {
  const mockAccount = { id: { fingerprint: 'asdf', accountIndex: 0 } };
  it('maps tx to send activity when any vin is owned by account, regardless of owned vouts', () => {
    const txNoVouts = {
      txid: '123',
      vin: [
        {
          address: 'bc1q123',
          value: 10000,
        },
        {
          address: 'bc1q456',
          owned: true,
          value: 10000,
        },
      ],
      vout: [
        {
          address: 'bc1q123',
          value: 10000,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const txOwnedVouts = {
      txid: '123',
      vin: [
        {
          address: 'bc1q123',
          value: 10000,
        },
        {
          address: 'bc1q456',
          owned: true,
          value: 10000,
        },
      ],
      vout: [
        {
          address: 'bc1q123',
          value: 10000,
        },
        {
          address: 'bc1q456',
          value: 10000,
          owned: true,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activityNoVouts = mapBitcoinTxToActivity(txNoVouts, mockAccount);
    const activityOwnedVouts = mapBitcoinTxToActivity(txOwnedVouts, mockAccount);
    expect(activityNoVouts!.type).toBe(OnChainActivityTypes.sendAsset);
    expect(activityOwnedVouts!.type).toBe(OnChainActivityTypes.sendAsset);
  });

  it('maps tx to receive activity when any vout is owned by account and no owned vins', () => {
    const tx = {
      txid: '123',
      vin: [
        {
          address: 'bc1q123',
          value: 10000,
        },
      ],
      vout: [
        {
          address: 'bc1q123',
          value: 10000,
        },
        {
          address: 'bc1q456',
          value: 10000,
          owned: true,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity!.type).toBe(OnChainActivityTypes.receiveAsset);
  });

  it('returns undefined when no owned vins or vout', () => {
    const tx = {
      txid: '123',
      vin: [
        {
          address: 'bc1q123',
          value: 10000,
        },
      ],
      vout: [
        {
          address: 'bc1q123',
          value: 10000,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity).toBe(undefined);
  });

  it('returns undefined when no owned vins or vout', () => {
    const tx = {
      txid: '123',
      vin: [
        {
          address: 'bc1q123',
          value: 10000,
        },
      ],
      vout: [
        {
          address: 'bc1q123',
          value: 10000,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity).toBe(undefined);
  });

  it('sums owned outputs for receive amounts', () => {
    const tx = {
      txid: '123',
      vin: [
        {
          address: 'bc1q123',
          value: 25000,
        },
      ],
      vout: [
        {
          address: 'bc1q456',
          value: 10000,
          owned: true,
        },
        {
          address: 'bc1q789',
          value: 10000,
          owned: true,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.receiveAsset);
    expect(activity?.amount.toNumber()).toBe(20000);
  });

  it('sums owned inputs and subtracts summed outputs for send amount', () => {
    const tx = {
      txid: '123',
      vin: [
        {
          address: 'bc1q456',
          value: 25000,
          owned: true,
        },
      ],
      vout: [
        {
          address: 'bc1q123',
          value: 10000,
        },
        {
          address: 'bc1q456',
          value: 10000,
          owned: true,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.sendAsset);
    expect(activity?.amount.toNumber()).toBe(15000);
  });

  it('aggregates all unique, non-owned vin addresses in senders for receives', () => {
    const tx = {
      txid: '123',
      vin: [
        {
          address: 'bc1q123',
          value: 10000,
        },
        {
          address: 'bc1q789',
          value: 25000,
        },
      ],
      vout: [
        {
          address: 'bc1q456',
          value: 10000,
          owned: true,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.receiveAsset);
    expect((activity as ReceiveAssetActivity).senders.length).toBe(2);
    expect((activity as ReceiveAssetActivity).senders).toEqual(
      expect.arrayContaining(['bc1q123', 'bc1q789'])
    );
  });

  it('aggregates all unique, non-owned vout addresses in receivers for sends', () => {
    const tx = {
      txid: '123',
      vin: [
        {
          address: 'bc1q456',
          value: 10000,
          owned: true,
        },
      ],
      vout: [
        {
          address: 'bc1q123',
          value: 10000,
        },
        {
          address: 'bc1q789',
          value: 25000,
        },
        {
          address: 'bc1q456',
          value: 10000,
          owned: true,
        },
      ],
    } as unknown as LeatherApiBitcoinTransaction;
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.sendAsset);
    expect((activity as SendAssetActivity).receivers.length).toBe(2);
    expect((activity as SendAssetActivity).receivers).toEqual(
      expect.arrayContaining(['bc1q123', 'bc1q789'])
    );
  });
});
