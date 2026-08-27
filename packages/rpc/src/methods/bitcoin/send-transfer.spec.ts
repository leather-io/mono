import {
  rpcSendTransferLegacyParamSchema,
  rpcSendTransferNewParamsSchema,
  sendTransfer,
} from './send-transfer';

describe('sendTransfer', () => {
  const legacyParams = {
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    amount: '10000',
    network: 'mainnet',
  };

  const newParams = {
    recipients: [{ address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: '10000' }],
    network: 'mainnet',
  };

  test('legacy params accept an omitted broadcast', () => {
    expect(rpcSendTransferLegacyParamSchema.safeParse(legacyParams).success).toEqual(true);
  });

  test('legacy params accept a boolean broadcast', () => {
    expect(
      rpcSendTransferLegacyParamSchema.safeParse({ ...legacyParams, broadcast: false }).success
    ).toEqual(true);
    expect(
      rpcSendTransferLegacyParamSchema.safeParse({ ...legacyParams, broadcast: true }).success
    ).toEqual(true);
  });

  test('legacy params reject a string broadcast', () => {
    expect(
      rpcSendTransferLegacyParamSchema.safeParse({ ...legacyParams, broadcast: 'false' }).success
    ).toEqual(false);
  });

  test('new params accept an omitted broadcast', () => {
    expect(rpcSendTransferNewParamsSchema.safeParse(newParams).success).toEqual(true);
  });

  test('new params accept a boolean broadcast', () => {
    expect(
      rpcSendTransferNewParamsSchema.safeParse({ ...newParams, broadcast: false }).success
    ).toEqual(true);
    expect(
      rpcSendTransferNewParamsSchema.safeParse({ ...newParams, broadcast: true }).success
    ).toEqual(true);
  });

  test('new params reject a string broadcast', () => {
    expect(
      rpcSendTransferNewParamsSchema.safeParse({ ...newParams, broadcast: 'false' }).success
    ).toEqual(false);
  });

  test('result schema accepts a txid without transaction', () => {
    expect(sendTransfer.result.safeParse({ txid: 'abc123' }).success).toEqual(true);
  });

  test('result schema accepts a transaction without txid', () => {
    expect(sendTransfer.result.safeParse({ transaction: '0200000001' }).success).toEqual(true);
  });

  test('result schema accepts a txid with transaction', () => {
    expect(
      sendTransfer.result.safeParse({ txid: 'abc123', transaction: '0200000001' }).success
    ).toEqual(true);
  });

  test('result schema accepts a multisig proposal with transaction', () => {
    expect(
      sendTransfer.result.safeParse({
        proposalId: 'prop-1',
        status: 'proposed',
        transaction: '0200000001',
      }).success
    ).toEqual(true);
  });
});
