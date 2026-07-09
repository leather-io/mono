import { describe, expect, test } from 'vitest';

import { getSendTransferRecipients } from './send-transfer.utils';

const recipientAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

describe(getSendTransferRecipients.name, () => {
  test('treats new-params recipient amounts as sat-denominated', () => {
    const recipients = getSendTransferRecipients({
      recipients: [{ address: recipientAddress, amount: '1' }],
      network: 'mainnet',
    });

    expect(recipients).toHaveLength(1);
    expect(recipients[0]?.amount.amount.toString()).toEqual('1');
    expect(recipients[0]?.amount.symbol).toEqual('BTC');
    expect(recipients[0]?.address).toEqual(recipientAddress);
  });

  test('treats legacy-param amount as sat-denominated', () => {
    const recipients = getSendTransferRecipients({
      address: recipientAddress,
      amount: '600',
      network: 'mainnet',
    });

    expect(recipients).toHaveLength(1);
    expect(recipients[0]?.amount.amount.toString()).toEqual('600');
    expect(recipients[0]?.amount.symbol).toEqual('BTC');
  });

  test('throws on fractional sat amounts', () => {
    expect(() =>
      getSendTransferRecipients({
        recipients: [{ address: recipientAddress, amount: '0.5' }],
        network: 'mainnet',
      })
    ).toThrowError('Send transfer amounts must be sat-denominated integers');
  });

  test('throws on fractional legacy-param amounts', () => {
    expect(() =>
      getSendTransferRecipients({
        address: recipientAddress,
        amount: '0.00000001',
        network: 'mainnet',
      })
    ).toThrowError('Send transfer amounts must be sat-denominated integers');
  });
});
