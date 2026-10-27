import type {
  ContractCallTransaction,
  SmartContractTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it } from 'vitest';

import {
  createMockAbstractTransaction,
  createMockTokenTransferTransaction,
  createMockTransactionsWithTransfersResponse,
} from '../../test/mock-stacks-txs';
import { filterVerboseUnusedTransactionWithTransferData } from './transactions-with-transfers.query';

function assertTxType<T extends Transaction['tx_type']>(
  tx: Transaction,
  txType: T
): asserts tx is Extract<Transaction, { tx_type: T }> {
  if (tx.tx_type !== txType) throw new Error(`Expected ${txType}, received ${tx.tx_type}`);
}

describe('filterVerboseUnusedTransactionWithTransferData', () => {
  it('should redact the source_code for smart_contract transactions', () => {
    const smartContractTx: SmartContractTransaction = {
      ...createMockAbstractTransaction(),
      tx_type: 'smart_contract',
      smart_contract: {
        contract_id: '',
        source_code: 'some_source_code',
      },
    };
    const input = createMockTransactionsWithTransfersResponse([smartContractTx]);

    const result = filterVerboseUnusedTransactionWithTransferData(input);
    const { tx } = result.results[0];
    assertTxType(tx, 'smart_contract');
    expect(tx.smart_contract.source_code).toBe('redacted');
  });

  it('should redact function_args and tx_result for contract_call transactions', () => {
    const contractCallTx: ContractCallTransaction = {
      ...createMockAbstractTransaction({ tx_result: { hex: '0xresult', repr: 'result_repr' } }),
      tx_type: 'contract_call',
      contract_call: {
        contract_id: '',
        function_name: '',
        function_signature: '',
        function_args: [
          { hex: '0x123', repr: 'arg1', name: 'a', type: 'uint' },
          { hex: '0x456', repr: 'arg2', name: 'b', type: 'uint' },
        ],
      },
    };
    const input = createMockTransactionsWithTransfersResponse([contractCallTx]);

    const result = filterVerboseUnusedTransactionWithTransferData(input);
    const { tx } = result.results[0];
    assertTxType(tx, 'contract_call');

    expect(tx.contract_call.function_args).toEqual([
      { hex: 'redacted', repr: 'redacted', name: 'a', type: 'uint' },
      { hex: 'redacted', repr: 'redacted', name: 'b', type: 'uint' },
    ]);
    expect(tx.tx_result).toEqual({ hex: 'redacted', repr: 'redacted' });
  });

  it('should handle contract_call transactions without function_args', () => {
    const contractCallTx: ContractCallTransaction = {
      ...createMockAbstractTransaction({ tx_result: { hex: '0xresult', repr: 'result_repr' } }),
      tx_type: 'contract_call',
      contract_call: {
        function_args: [],
        contract_id: '',
        function_name: '',
        function_signature: '',
      },
    };
    const input = createMockTransactionsWithTransfersResponse([contractCallTx]);

    const result = filterVerboseUnusedTransactionWithTransferData(input);

    // function_args should remain undefined and tx_result should be redacted
    expect(result.results[0].tx.tx_result).toEqual({ hex: 'redacted', repr: 'redacted' });
  });

  it('should not modify transactions that are not smart_contract or contract_call type', () => {
    const tokenTransferTx = createMockTokenTransferTransaction();
    const input = createMockTransactionsWithTransfersResponse([tokenTransferTx]);

    const result = filterVerboseUnusedTransactionWithTransferData(input);

    expect(result.results[0].tx).toEqual(createMockTokenTransferTransaction());
  });
});
