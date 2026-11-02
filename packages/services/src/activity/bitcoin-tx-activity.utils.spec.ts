import { OnChainActivityStatuses, OnChainActivityTypes } from '@leather.io/models';
import { dateToUnixTimestamp } from '@leather.io/utils';

import { createActivityBitcoinTx } from '../test/activity-fixtures';
import {
  mapBitcoinTxBlockTime,
  mapBitcoinTxStatus,
  mapBitcoinTxToActivity,
} from './bitcoin-tx-activity.utils';

describe(mapBitcoinTxBlockTime.name, () => {
  it('returns blocktime when time and height fields present', () => {
    const blockTime = mapBitcoinTxBlockTime(
      createActivityBitcoinTx({
        height: 123,
        time: 456,
      })
    );
    expect(blockTime).toBe(456);
  });
  it('defaults to current timestamp when no time or height', () => {
    const now = dateToUnixTimestamp(new Date());
    const blockTimeNoHeight = mapBitcoinTxBlockTime(
      createActivityBitcoinTx({
        time: 456,
      })
    );
    const blockTimeNoTime = mapBitcoinTxBlockTime(
      createActivityBitcoinTx({
        height: 456,
      })
    );
    const blockTimeNoHeightOrTime = mapBitcoinTxBlockTime(
      createActivityBitcoinTx({
        height: 456,
      })
    );
    expect(blockTimeNoHeight).toBeGreaterThanOrEqual(now);
    expect(blockTimeNoTime).toBeGreaterThanOrEqual(now);
    expect(blockTimeNoHeightOrTime).toBeGreaterThanOrEqual(now);
  });
});

describe(mapBitcoinTxStatus.name, () => {
  it('returns success if height field present, otherwise returns pending', () => {
    const statusWithBlockHeight = mapBitcoinTxStatus(
      createActivityBitcoinTx({
        height: 456,
      })
    );
    const statusNoBlockHeight = mapBitcoinTxStatus(createActivityBitcoinTx({}));
    expect(statusWithBlockHeight).toBe(OnChainActivityStatuses.success);
    expect(statusNoBlockHeight).toBe(OnChainActivityStatuses.pending);
  });
});

describe(mapBitcoinTxToActivity.name, () => {
  const mockAccount = { id: { fingerprint: 'asdf', accountIndex: 0 } };
  it('maps tx to send activity when any vin is owned by account, regardless of owned vouts', () => {
    const txNoVouts = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
        {
          n: 0,
          address: 'bc1q456',
          owned: true,
          value: '10000',
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
      ],
    });
    const txOwnedVouts = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
        {
          n: 0,
          address: 'bc1q456',
          owned: true,
          value: '10000',
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
        {
          n: 0,
          address: 'bc1q456',
          value: '10000',
          owned: true,
        },
      ],
    });
    const activityNoVouts = mapBitcoinTxToActivity(txNoVouts, mockAccount);
    const activityOwnedVouts = mapBitcoinTxToActivity(txOwnedVouts, mockAccount);
    expect(activityNoVouts?.type).toBe(OnChainActivityTypes.sendAsset);
    expect(activityOwnedVouts?.type).toBe(OnChainActivityTypes.sendAsset);
  });

  it('maps tx to receive activity when any vout is owned by account and no owned vins', () => {
    const tx = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
        {
          n: 0,
          address: 'bc1q456',
          value: '10000',
          owned: true,
        },
      ],
    });
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.receiveAsset);
  });

  it('returns undefined when no owned vins or vout', () => {
    const tx = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
      ],
    });
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity).toBe(undefined);
  });

  it('returns undefined when no owned vins or vout', () => {
    const tx = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
      ],
    });
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity).toBe(undefined);
  });

  it('sums owned outputs for receive amounts', () => {
    const tx = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q123',
          value: '25000',
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q456',
          value: '10000',
          owned: true,
        },
        {
          n: 0,
          address: 'bc1q789',
          value: '10000',
          owned: true,
        },
      ],
    });
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.receiveAsset);
    expect(activity?.amount.toNumber()).toBe(20000);
  });

  it('sums owned inputs and subtracts summed outputs for send amount', () => {
    const tx = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q456',
          value: '25000',
          owned: true,
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
        {
          n: 0,
          address: 'bc1q456',
          value: '10000',
          owned: true,
        },
      ],
    });
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.sendAsset);
    expect(activity?.amount.toNumber()).toBe(15000);
  });

  it('aggregates all unique, non-owned vin addresses in senders for receives', () => {
    const tx = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
        {
          n: 0,
          address: 'bc1q789',
          value: '25000',
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q456',
          value: '10000',
          owned: true,
        },
      ],
    });
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.receiveAsset);
    if (activity?.type !== OnChainActivityTypes.receiveAsset) throw new Error('Expected receive');
    expect(activity.senders.length).toBe(2);
    expect(activity.senders).toEqual(expect.arrayContaining(['bc1q123', 'bc1q789']));
  });

  it('aggregates all unique, non-owned vout addresses in receivers for sends', () => {
    const tx = createActivityBitcoinTx({
      txid: '123',
      vin: [
        {
          n: 0,
          address: 'bc1q456',
          value: '10000',
          owned: true,
        },
      ],
      vout: [
        {
          n: 0,
          address: 'bc1q123',
          value: '10000',
        },
        {
          n: 0,
          address: 'bc1q789',
          value: '25000',
        },
        {
          n: 0,
          address: 'bc1q456',
          value: '10000',
          owned: true,
        },
      ],
    });
    const activity = mapBitcoinTxToActivity(tx, mockAccount);
    expect(activity?.type).toBe(OnChainActivityTypes.sendAsset);
    if (activity?.type !== OnChainActivityTypes.sendAsset) throw new Error('Expected send');
    expect(activity.receivers.length).toBe(2);
    expect(activity.receivers).toEqual(expect.arrayContaining(['bc1q123', 'bc1q789']));
  });
});
