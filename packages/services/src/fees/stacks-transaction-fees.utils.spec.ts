import {
  PayloadType,
  StacksTransactionWire,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';

import { estimateStacksTransactionByteLength } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { HiroTransactionFeeEstimateResponse } from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { StacksFeeConfig } from '../infrastructure/app-config/app-config.service';
import {
  createStacksTransactionFeeQuote,
  getStacksMinimumFeeAmount,
  getStacksTxFeeBoundedEstimates,
  getStacksTxFeeDefaultAmounts,
  getStacksTxPayloadTypeFees,
} from './stacks-transaction-fees.utils';

const mockStacksFeeConfig: StacksFeeConfig = {
  minimumRelayFeeRate: 1,
  transfers: {
    low: { default: 1000, minimum: 500, maximum: 5000 },
    standard: { default: 2000, minimum: 1000, maximum: 10000 },
    high: { default: 5000, minimum: 2000, maximum: 20000 },
  },
  contractCalls: {
    low: { default: 2000, minimum: 1000, maximum: 10000 },
    standard: { default: 4000, minimum: 2000, maximum: 20000 },
    high: { default: 10000, minimum: 5000, maximum: 50000 },
  },
  contractDeployments: {
    low: { default: 5000, minimum: 2500, maximum: 25000 },
    standard: { default: 10000, minimum: 5000, maximum: 50000 },
    high: { default: 25000, minimum: 10000, maximum: 100000 },
  },
  sipTokenSends: {
    low: { default: 1500, minimum: 750, maximum: 7500 },
    standard: { default: 3000, minimum: 1500, maximum: 15000 },
    high: { default: 7500, minimum: 3000, maximum: 30000 },
  },
} as unknown as StacksFeeConfig;

const mockHiroFeeEstimateResponse: HiroTransactionFeeEstimateResponse = {
  estimations: [{ fee: 800 }, { fee: 1600 }, { fee: 4000 }],
} as unknown as HiroTransactionFeeEstimateResponse;

const mockTokenTransferTx: Partial<StacksTransactionWire> = {
  payload: {
    payloadType: PayloadType.TokenTransfer,
  },
} as StacksTransactionWire;

const mockContractCallTx: Partial<StacksTransactionWire> = {
  payload: {
    payloadType: PayloadType.ContractCall,
  },
} as StacksTransactionWire;

const mockContractDeployTx: Partial<StacksTransactionWire> = {
  payload: {
    payloadType: PayloadType.SmartContract,
  },
} as StacksTransactionWire;

describe(getStacksTxPayloadTypeFees.name, () => {
  it('should return transfers config for TokenTransfer payload', () => {
    const result = getStacksTxPayloadTypeFees(
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig
    );
    expect(result).toEqual(mockStacksFeeConfig.transfers);
  });

  it('should return contractCalls config for ContractCall payload', () => {
    const result = getStacksTxPayloadTypeFees(
      mockContractCallTx as StacksTransactionWire,
      mockStacksFeeConfig
    );
    expect(result).toEqual(mockStacksFeeConfig.contractCalls);
  });

  it('should return contractDeployments config for SmartContract payload', () => {
    const result = getStacksTxPayloadTypeFees(
      mockContractDeployTx as StacksTransactionWire,
      mockStacksFeeConfig
    );
    expect(result).toEqual(mockStacksFeeConfig.contractDeployments);
  });

  it('should return contractDeployments config for VersionedSmartContract payload', () => {
    const mockVersionedContractTx: Partial<StacksTransactionWire> = {
      payload: {
        payloadType: PayloadType.VersionedSmartContract,
      },
    } as StacksTransactionWire;

    const result = getStacksTxPayloadTypeFees(
      mockVersionedContractTx as StacksTransactionWire,
      mockStacksFeeConfig
    );
    expect(result).toEqual(mockStacksFeeConfig.contractDeployments);
  });

  it('should return transfers config as default for unknown payload type', () => {
    const mockUnknownTx: Partial<StacksTransactionWire> = {
      payload: {
        payloadType: 'Unknown' as unknown as PayloadType,
      },
    } as StacksTransactionWire;

    const result = getStacksTxPayloadTypeFees(
      mockUnknownTx as StacksTransactionWire,
      mockStacksFeeConfig
    );
    expect(result).toEqual(mockStacksFeeConfig.transfers);
  });
});

describe(getStacksTxFeeDefaultAmounts.name, () => {
  test('keeps fallback fees above the signed multisig transaction minimum', async () => {
    const publicKeys = [
      '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352',
      '03774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
      '02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
    ];
    const tx = await makeUnsignedSTXTokenTransfer({
      publicKeys,
      numSignatures: 2,
      useNonSequentialMultiSig: true,
      recipient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      amount: 1,
      fee: 0,
      nonce: 0,
      network: 'testnet',
    });
    const size = estimateStacksTransactionByteLength(tx, publicKeys.length);
    const config = {
      ...mockStacksFeeConfig,
      transfers: {
        low: { default: 240, minimum: 180, maximum: 299 },
        standard: { default: 400, minimum: 300, maximum: 800 },
        high: { default: 901, minimum: 801, maximum: 1001 },
      },
    };
    expect(size).toBeGreaterThan(config.transfers.low.default);
    const fees = getStacksTxFeeDefaultAmounts(tx, config, size);
    expect(fees.low).toBe(size);
    expect(fees.standard).toBeGreaterThanOrEqual(size);
    expect(fees.high).toBeGreaterThanOrEqual(size);
  });

  it('should return default fee amounts for TokenTransfer', () => {
    const result = getStacksTxFeeDefaultAmounts(
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig,
      200
    );

    expect(result).toEqual({
      low: 1000,
      standard: 2000,
      high: 5000,
    });
  });

  it('should return default fee amounts for ContractCall', () => {
    const result = getStacksTxFeeDefaultAmounts(
      mockContractCallTx as StacksTransactionWire,
      mockStacksFeeConfig,
      200
    );

    expect(result).toEqual({
      low: 2000,
      standard: 4000,
      high: 10000,
    });
  });

  it('should return default fee amounts for ContractDeploy', () => {
    const result = getStacksTxFeeDefaultAmounts(
      mockContractDeployTx as StacksTransactionWire,
      mockStacksFeeConfig,
      200
    );

    expect(result).toEqual({
      low: 5000,
      standard: 10000,
      high: 25000,
    });
  });
});

describe(getStacksMinimumFeeAmount.name, () => {
  test('never allows a configured relay rate below one microSTX per byte', () => {
    expect(getStacksMinimumFeeAmount(345, { ...mockStacksFeeConfig, minimumRelayFeeRate: 0 })).toBe(
      345
    );
  });

  test('rounds fractional relay fees up to a whole microSTX', () => {
    expect(
      getStacksMinimumFeeAmount(345, { ...mockStacksFeeConfig, minimumRelayFeeRate: 1.5 })
    ).toBe(518);
  });
});

describe(getStacksTxFeeBoundedEstimates.name, () => {
  const estimatedTxSize = 200;

  it('should return bounded fee estimates for TokenTransfer', () => {
    const result = getStacksTxFeeBoundedEstimates(
      mockHiroFeeEstimateResponse,
      estimatedTxSize,
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig
    );

    expect(result).toEqual({
      low: 800,
      standard: 1600,
      high: 4000,
    });
  });

  it('should enforce minimum relay fee', () => {
    const bigTxSize = 6000;
    const minRelayFee = bigTxSize * mockStacksFeeConfig.minimumRelayFeeRate;

    const lowFeeResponse: HiroTransactionFeeEstimateResponse = {
      estimations: [{ fee: 50 }, { fee: 100 }, { fee: 150 }],
    } as unknown as HiroTransactionFeeEstimateResponse;

    const result = getStacksTxFeeBoundedEstimates(
      lowFeeResponse,
      bigTxSize,
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig
    );

    expect(result.low).toBe(minRelayFee);
    expect(result.standard).toBe(minRelayFee);
    expect(result.high).toBe(minRelayFee);
  });

  it('should enforce maximum bounds', () => {
    const highFeeResponse: HiroTransactionFeeEstimateResponse = {
      estimations: [{ fee: 10000 }, { fee: 20000 }, { fee: 50000 }],
    } as unknown as HiroTransactionFeeEstimateResponse;

    const result = getStacksTxFeeBoundedEstimates(
      highFeeResponse,
      estimatedTxSize,
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig
    );

    expect(result.low).toBe(5000);
    expect(result.standard).toBe(10000);
    expect(result.high).toBe(20000);
  });

  it('should enforce minimum bounds', () => {
    const lowFeeResponse: HiroTransactionFeeEstimateResponse = {
      estimations: [{ fee: 100 }, { fee: 200 }, { fee: 500 }],
    } as unknown as HiroTransactionFeeEstimateResponse;

    const result = getStacksTxFeeBoundedEstimates(
      lowFeeResponse,
      estimatedTxSize,
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig
    );

    expect(result.low).toBe(500);
    expect(result.standard).toBe(1000);
    expect(result.high).toBe(2000);
  });

  it('should handle missing API estimates gracefully', () => {
    const emptyResponse: HiroTransactionFeeEstimateResponse = {
      estimations: [],
    } as unknown as HiroTransactionFeeEstimateResponse;

    const result = getStacksTxFeeBoundedEstimates(
      emptyResponse,
      estimatedTxSize,
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig
    );

    // Should fall back to default values
    expect(result.low).toBe(mockStacksFeeConfig.transfers.low.default);
    expect(result.standard).toBe(mockStacksFeeConfig.transfers.standard.default);
    expect(result.high).toBe(mockStacksFeeConfig.transfers.high.default);
  });

  it('should handle partial API estimates', () => {
    const partialResponse: HiroTransactionFeeEstimateResponse = {
      estimations: [
        { fee: 800 },
        // Missing standard and high estimates
      ],
    } as unknown as HiroTransactionFeeEstimateResponse;

    const result = getStacksTxFeeBoundedEstimates(
      partialResponse,
      estimatedTxSize,
      mockTokenTransferTx as StacksTransactionWire,
      mockStacksFeeConfig
    );

    expect(result.low).toBe(800);
    expect(result.standard).toBe(mockStacksFeeConfig.transfers.standard.default);
    expect(result.high).toBe(mockStacksFeeConfig.transfers.high.default);
  });
});

describe(createStacksTransactionFeeQuote.name, () => {
  it('should create a fee quote with correct properties', () => {
    const fee = 2000;
    const estimatedTxSize = 200;

    const result = createStacksTransactionFeeQuote(fee, estimatedTxSize);

    expect(result).toEqual({
      type: 'stacksFeeRate',
      value: createMoney(fee, 'STX'),
      rate: 10,
      rateUnit: 'µSTX/byte',
      estimatedTxSize: 200,
      sizeUnit: 'byte',
    });
  });

  it('should calculate fee rate correctly with decimal result', () => {
    const fee = 1500;
    const estimatedTxSize = 200;

    const result = createStacksTransactionFeeQuote(fee, estimatedTxSize);

    expect(result.rate).toBe(8);
  });

  it('should handle zero fee', () => {
    const fee = 0;
    const estimatedTxSize = 200;

    const result = createStacksTransactionFeeQuote(fee, estimatedTxSize);

    expect(result).toEqual({
      type: 'stacksFeeRate',
      value: createMoney(0, 'STX'),
      rate: 0,
      rateUnit: 'µSTX/byte',
      estimatedTxSize: 200,
      sizeUnit: 'byte',
    });
  });

  it('should handle very small fee', () => {
    const fee = 1;
    const estimatedTxSize = 200;

    const result = createStacksTransactionFeeQuote(fee, estimatedTxSize);

    expect(result.rate).toBe(1);
  });
});
