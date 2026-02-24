import { describe, expect, it } from 'vitest';

import { extractStacksRawEvents } from './stacks-activity-event.utils';

describe('extractStacksRawEvents', () => {
  const stxAddress = 'SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H';

  describe('consolidation', () => {
    it('consolidates multi-hop swap to net sent/received per asset', () => {
      const events = extractStacksRawEvents(
        [
          stxTransferEvent(stxAddress, 'SM1793...pool', '4995000', 1),
          stxTransferEvent(stxAddress, 'SP31C60...fee', '5000', 7),
          ftTransferEvent('aeUSDC', 'SM1793...xyk-pool', stxAddress, '1344074', 4),
          ftTransferEvent('aeUSDC', stxAddress, 'SM1793...stableswap', '1343806', 13),
          ftTransferEvent('aeUSDC', stxAddress, 'SP31C60...fee', '268', 18),
          ftTransferEvent('USDCx', 'SM1793...stableswap-aeusdc', stxAddress, '1343728', 15),
          ftTransferEvent('USDCx', stxAddress, 'SM1793...stableswap-usdh', '1343460', 22),
          ftTransferEvent('USDCx', stxAddress, 'SP31C60...fee', '268', 27),
          ftTransferEvent('USDh', 'SM1793...stableswap-usdh', stxAddress, '134352964', 23),
        ],
        stxAddress
      );

      expect(events).toHaveLength(2);

      const stxEvent = events.find(e => e.assetIdentifier === 'STX');
      expect(stxEvent).toMatchObject({
        action: 'sent',
        assetIdentifier: 'STX',
        rawAmount: '5000000',
      });

      const usdhEvent = events.find(e => e.assetIdentifier === 'USDh');
      expect(usdhEvent).toMatchObject({
        action: 'received',
        assetIdentifier: 'USDh',
        rawAmount: '134352964',
      });
    });

    it('drops intermediate assets that net to zero', () => {
      const events = extractStacksRawEvents(
        [
          ftTransferEvent('TokenA', 'pool1', stxAddress, '1000', 1),
          ftTransferEvent('TokenA', stxAddress, 'pool2', '1000', 2),
        ],
        stxAddress
      );

      expect(events).toHaveLength(0);
    });

    it('preserves counterparty from the largest individual event', () => {
      const events = extractStacksRawEvents(
        [
          stxTransferEvent(stxAddress, 'small-recipient', '1000', 1),
          stxTransferEvent(stxAddress, 'large-recipient', '9000', 2),
        ],
        stxAddress
      );

      expect(events).toHaveLength(1);
      expect(events[0].counterparty).toBe('large-recipient');
      expect(events[0].rawAmount).toBe('10000');
    });

    it('passes through minted, burned, and locked events unchanged', () => {
      const events = extractStacksRawEvents(
        [
          {
            event_index: 1,
            event_type: 'stx_lock',
            tx_id: '0x123',
            stx_lock_event: {
              locked_amount: '500000',
              unlock_height: 100,
              locked_address: stxAddress,
            },
          },
          {
            event_index: 2,
            event_type: 'fungible_token_asset',
            tx_id: '0x123',
            asset: {
              asset_event_type: 'mint',
              asset_id: 'LP-token',
              recipient: stxAddress,
              sender: '',
              amount: '1000',
            },
          },
        ],
        stxAddress
      );

      expect(events).toHaveLength(2);
      expect(events[0]).toMatchObject({ action: 'locked', rawAmount: '500000' });
      expect(events[1]).toMatchObject({ action: 'minted', rawAmount: '1000' });
    });

    it('passes through NFT events without consolidation', () => {
      const events = extractStacksRawEvents(
        [
          {
            event_index: 1,
            event_type: 'non_fungible_token_asset',
            tx_id: '0x123',
            asset: {
              asset_event_type: 'transfer',
              asset_id: 'NFT-collection',
              sender: stxAddress,
              recipient: 'buyer',
              value: { hex: '0x01', repr: 'u1' },
            },
          },
          {
            event_index: 2,
            event_type: 'non_fungible_token_asset',
            tx_id: '0x123',
            asset: {
              asset_event_type: 'transfer',
              asset_id: 'NFT-collection',
              sender: 'seller',
              recipient: stxAddress,
              value: { hex: '0x02', repr: 'u2' },
            },
          },
        ],
        stxAddress
      );

      expect(events).toHaveLength(2);
      expect(events[0]).toMatchObject({ action: 'sent', nftTokenHex: '0x01' });
      expect(events[1]).toMatchObject({ action: 'received', nftTokenHex: '0x02' });
    });
  });
});

function stxTransferEvent(sender: string, recipient: string, amount: string, index: number) {
  return {
    event_index: index,
    event_type: 'stx_asset' as const,
    tx_id: '0x123',
    asset: {
      asset_event_type: 'transfer' as const,
      sender,
      recipient,
      amount,
    },
  };
}

function ftTransferEvent(
  assetId: string,
  sender: string,
  recipient: string,
  amount: string,
  index: number
) {
  return {
    event_index: index,
    event_type: 'fungible_token_asset' as const,
    tx_id: '0x123',
    asset: {
      asset_event_type: 'transfer' as const,
      asset_id: assetId,
      sender,
      recipient,
      amount,
    },
  };
}
