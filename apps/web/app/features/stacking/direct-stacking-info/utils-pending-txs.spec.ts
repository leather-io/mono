import { type PendingTransactionArgs, getHasPendingTransaction } from './utils-pending-txs';

type FetchedTransaction = Awaited<
  ReturnType<PendingTransactionArgs['stacksClient']['getTransactionById']>
>;

const address = 'SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST';
const targetContractId = 'SP000000000000000000002Q6VF78.pox-5';

const tokenTransferSummary = { tx_id: '0xtransfer' };
const otherCallSummary = {
  tx_id: '0xother',
  contract_call: { contract_id: 'SP000000000000000000002Q6VF78.pox-4', function_name: 'stack-stx' },
};
const newestTargetCallSummary = {
  tx_id: '0xnewest',
  contract_call: { contract_id: targetContractId, function_name: 'stake' },
};
const olderTargetCallSummary = {
  tx_id: '0xolder',
  contract_call: { contract_id: targetContractId, function_name: 'unstake' },
};

const newestTargetCallTx: FetchedTransaction = {
  type: 'contract_call',
  tx_id: '0xnewest',
  contract_call: {
    contract_id: targetContractId,
    function_name: 'stake',
    function_args: [{ hex: '0x01' }],
  },
};

function createStacksClient(
  results: { tx_id: string; contract_call?: { contract_id: string; function_name: string } }[]
) {
  return {
    getPrincipalMempoolTransactions: vi.fn().mockResolvedValue({ results }),
    getTransactionById: vi.fn().mockResolvedValue(newestTargetCallTx),
  };
}

function isTargetCall(t: { contract_call: { contract_id: string } }) {
  return t.contract_call.contract_id === targetContractId;
}

function readTxId(t: { tx_id: string }) {
  return t.tx_id;
}

describe(getHasPendingTransaction.name, () => {
  test('returns null without fetching transaction details when no mempool tx matches', async () => {
    const stacksClient = createStacksClient([tokenTransferSummary, otherCallSummary]);

    const result = await getHasPendingTransaction({
      stacksClient,
      address,
      transactionPredicate: isTargetCall,
      transactionConverter: readTxId,
    });

    expect(result).toBeNull();
    expect(stacksClient.getPrincipalMempoolTransactions).toHaveBeenCalledWith(
      address,
      expect.any(AbortSignal)
    );
    expect(stacksClient.getTransactionById).not.toHaveBeenCalled();
  });

  test('fetches the newest matching mempool call with its function args and converts it', async () => {
    const stacksClient = createStacksClient([
      tokenTransferSummary,
      newestTargetCallSummary,
      otherCallSummary,
      olderTargetCallSummary,
    ]);
    const transactionConverter = vi.fn(readTxId);

    const result = await getHasPendingTransaction({
      stacksClient,
      address,
      transactionPredicate: isTargetCall,
      transactionConverter,
    });

    expect(result).toBe('0xnewest');
    expect(stacksClient.getTransactionById).toHaveBeenCalledTimes(1);
    expect(stacksClient.getTransactionById).toHaveBeenCalledWith(
      '0xnewest',
      expect.any(AbortSignal),
      ['function_args']
    );
    expect(transactionConverter).toHaveBeenCalledWith(newestTargetCallTx);
  });

  test('returns null when the fetched transaction is not a contract call', async () => {
    const stacksClient = createStacksClient([newestTargetCallSummary]);
    stacksClient.getTransactionById.mockResolvedValue({ type: 'token_transfer' });
    const transactionConverter = vi.fn(readTxId);

    const result = await getHasPendingTransaction({
      stacksClient,
      address,
      transactionPredicate: isTargetCall,
      transactionConverter,
    });

    expect(result).toBeNull();
    expect(transactionConverter).not.toHaveBeenCalled();
  });
});
