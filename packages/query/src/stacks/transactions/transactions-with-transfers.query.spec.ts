import { AddressTransactionsWithTransfersListResponse } from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it } from 'vitest';

import { filterVerboseUnusedTransactionWithTransferData } from './transactions-with-transfers.query';

describe('filterVerboseUnusedTransactionWithTransferData', () => {
  it('should redact the source_code for smart_contract transactions', () => {
    const input = {
      results: [
        {
          tx: {
            tx_type: 'smart_contract',
            smart_contract: {
              source_code: 'some_source_code',
            },
          },
        },
      ],
    } as AddressTransactionsWithTransfersListResponse;

    const result = filterVerboseUnusedTransactionWithTransferData(input as any) as any;
    expect(result.results[0].tx?.smart_contract?.source_code).toBe('redacted');
  });

  it('should redact function_args and tx_result for contract_call transactions', () => {
    const input = {
      results: [
        {
          tx: {
            tx_type: 'contract_call',
            contract_call: {
              function_args: [
                { hex: '0x123', repr: 'arg1' },
                { hex: '0x456', repr: 'arg2' },
              ],
            },
            tx_result: { hex: '0xresult', repr: 'result_repr' },
          },
        },
      ],
    } as AddressTransactionsWithTransfersListResponse;

    const result = filterVerboseUnusedTransactionWithTransferData(input) as any;

    expect(result.results[0].tx.contract_call?.function_args).toEqual([
      { hex: 'redacted', repr: 'redacted' },
      { hex: 'redacted', repr: 'redacted' },
    ]);
    expect(result.results[0].tx.tx_result).toEqual({ hex: 'redacted', repr: 'redacted' });
  });

  it('should handle contract_call transactions without function_args', () => {
    const input = {
      results: [
        {
          tx: {
            tx_type: 'contract_call',
            contract_call: {
              function_args: [],
              contract_id: '',
              function_name: '',
              function_signature: '',
            },
            tx_result: { hex: '0xresult', repr: 'result_repr' },
          },
        },
      ],
    } as unknown as AddressTransactionsWithTransfersListResponse;

    const result = filterVerboseUnusedTransactionWithTransferData(input);

    // function_args should remain undefined and tx_result should be redacted
    expect(result.results[0].tx.tx_result).toEqual({ hex: 'redacted', repr: 'redacted' });
  });

  it('should not modify transactions that are not smart_contract or contract_call type', () => {
    const input = {
      results: [{ tx: { tx_type: 'transfer' } }],
    } as unknown as AddressTransactionsWithTransfersListResponse;

    const result = filterVerboseUnusedTransactionWithTransferData(input);

    expect(result.results[0].tx).toEqual({ tx_type: 'transfer' });
  });
});
