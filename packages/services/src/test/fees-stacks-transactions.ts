import {
  AddressHashMode,
  ClarityVersion,
  type PayloadInput,
  StacksTransactionWire,
  createCoinbasePayload,
  createContractCallPayload,
  createSingleSigSpendingCondition,
  createSmartContractPayload,
  createStandardAuth,
  createTokenTransferPayload,
} from '@stacks/transactions';

import { type HiroTransactionFeeEstimateResponse } from '../infrastructure/api/hiro/hiro-stacks-api.types';

const testPublicKey = '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352';
const testRecipient = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
const coinbaseByteLength = 32;

function createStacksTransactionWithPayload(payload: PayloadInput) {
  return new StacksTransactionWire({
    payload,
    auth: createStandardAuth(
      createSingleSigSpendingCondition(AddressHashMode.P2PKH, testPublicKey, 0, 0)
    ),
    network: 'testnet',
  });
}

export function createTokenTransferTx() {
  return createStacksTransactionWithPayload(createTokenTransferPayload(testRecipient, 1));
}

export function createContractCallTx() {
  return createStacksTransactionWithPayload(
    createContractCallPayload(testRecipient, 'test-contract', 'test-function', [])
  );
}

export function createSmartContractTx() {
  return createStacksTransactionWithPayload(
    createSmartContractPayload('test-contract', '(define-data-var counter uint u0)')
  );
}

export function createVersionedSmartContractTx() {
  return createStacksTransactionWithPayload(
    createSmartContractPayload(
      'test-contract',
      '(define-data-var counter uint u0)',
      ClarityVersion.Clarity2
    )
  );
}

export function createCoinbaseTx() {
  return createStacksTransactionWithPayload(
    createCoinbasePayload(new Uint8Array(coinbaseByteLength))
  );
}

export function createHiroFeeEstimateResponse(
  overrides: Partial<HiroTransactionFeeEstimateResponse> = {}
): HiroTransactionFeeEstimateResponse {
  return {
    estimated_cost_scalar: 0,
    estimated_cost: {
      read_count: 0,
      read_length: 0,
      runtime: 0,
      write_count: 0,
      write_length: 0,
    },
    estimations: [],
    ...overrides,
  };
}
