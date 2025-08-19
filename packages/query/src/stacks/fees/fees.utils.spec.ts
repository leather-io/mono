import { PayloadType } from '@stacks/transactions';

import { createMoney } from '@leather.io/utils';

import {
  enforceContractCallMinimumFees,
  getFeeEstimationsBasedOnDefaultMinMaxValues,
  parseStacksTxFeeEstimationResponse,
} from './fees.utils';

const hiroFees = [
  { fee: 2499, fee_rate: 0 },
  { fee: 3500, fee_rate: 0 },
  { fee: 6000, fee_rate: 0 },
];

const defaultFees = {
  low: {
    min: 2500,
    max: 2999,
  },
  standard: {
    min: 3000,
    max: 10000,
  },
  high: {
    min: 10000,
    max: 1000001,
  },
};

const expectedResult = ['2499', '3500', '10000'];

describe(getFeeEstimationsBasedOnDefaultMinMaxValues.name, () => {
  it('should return proper fee estimations', () => {
    const result = getFeeEstimationsBasedOnDefaultMinMaxValues({
      defaultEstimations: defaultFees,
      hiroFeeEstimations: hiroFees,
    });

    const lowFeeResult = result[0].fee.amount.toString();
    const standardFeeResult = result[1].fee.amount.toString();
    const highFeeResult = result[2].fee.amount.toString();

    // expect the lowest for the low estimation
    expect(lowFeeResult).toEqual(expectedResult[0]);
    // if hiro fee is between the min max estimation range, return the hiro fee
    expect(standardFeeResult).toEqual(expectedResult[1]);
    // if high hiro fee estimation is greater than the max estimation range, return the max estimation range
    expect(highFeeResult).toEqual(expectedResult[2]);
  });
});

describe('Contract call fee validation', () => {
  // https://github.com/leather-io/extension/issues/6251
  describe('minimum fee enforcement for contract calls - FIXED BEHAVIOR', () => {
    it('enforces minimum fee of tx size * 1µSTX for large contract call transactions', () => {
      // Create a large transaction that should require high fees
      const largeTxByteLength = 5000; // 5000 bytes
      const minimumFeeRequiredInMicroStx = largeTxByteLength * 1; // 5000 µSTX minimum required

      // Mock Hiro API fee estimations that are way too low for such a large transaction
      const unrealisticallyLowFeeEstimations = [
        { fee: 1000, fee_rate: 0 },
        { fee: 2000, fee_rate: 0 },
        { fee: 3000, fee_rate: 0 },
      ];

      // Default fee configuration that also allows fees lower than tx size * 1µSTX
      const contractCallDefaultFeeEstimations = {
        low: { min: 500, max: 2000 }, // Allows down to 500 µSTX
        standard: { min: 1500, max: 4000 }, // Allows down to 1500 µSTX
        high: { min: 3000, max: 8000 }, // Allows down to 3000 µSTX
      };

      const result = parseStacksTxFeeEstimationResponse({
        feeEstimation: {
          cost_scalar_change_by_byte: 1,
          estimated_cost: {},
          estimated_cost_scalar: 1000,
          estimations: unrealisticallyLowFeeEstimations,
          error: undefined,
        },
        payloadType: PayloadType.ContractCall,
        maxValues: undefined,
        minValues: undefined,
        txByteLength: largeTxByteLength,
        tokenTransferFeeEstimations: [],
        contractCallDefaultFeeEstimations,
        contractDeploymentDefaultFeeEstimations: undefined,
      });

      // ALL fees returned should be at least txByteLength * 1µSTX
      // Now they are properly enforced by the fix
      const lowestFee = Math.min(...result.estimates.map(e => e.fee.amount.toNumber()));

      // This assertion now PASSES - the fix ensures the lowest fee meets the minimum required
      expect(lowestFee).toBeGreaterThanOrEqual(minimumFeeRequiredInMicroStx);
    });

    it('ensures no fees are below minimum threshold', () => {
      const mediumTxByteLength = 3500; // 3500 bytes
      const minimumFeeRequiredInMicroStx = mediumTxByteLength * 1; // 3500 µSTX minimum

      const belowMinimumFeeEstimations = [
        { fee: 2000, fee_rate: 0 }, // 2000 µSTX - below 3500 µSTX minimum
        { fee: 3000, fee_rate: 0 }, // 3000 µSTX - below 3500 µSTX minimum
        { fee: 4000, fee_rate: 0 }, // 4000 µSTX - above minimum (ok)
      ];

      const contractCallDefaultFeeEstimations = {
        low: { min: 1000, max: 2500 }, // Max 2500 µSTX - below 3500 minimum
        standard: { min: 2500, max: 3200 }, // Max 3200 µSTX - below 3500 minimum
        high: { min: 3500, max: 5000 }, // This range is acceptable
      };

      const result = parseStacksTxFeeEstimationResponse({
        feeEstimation: {
          cost_scalar_change_by_byte: 1,
          estimated_cost: {},
          estimated_cost_scalar: 1000,
          estimations: belowMinimumFeeEstimations,
          error: undefined,
        },
        payloadType: PayloadType.ContractCall,
        maxValues: undefined,
        minValues: undefined,
        txByteLength: mediumTxByteLength,
        tokenTransferFeeEstimations: [],
        contractCallDefaultFeeEstimations,
        contractDeploymentDefaultFeeEstimations: undefined,
      });

      // Count how many fees are below the minimum threshold
      const feesBelowMinimum = result.estimates.filter(
        estimate => estimate.fee.amount.toNumber() < minimumFeeRequiredInMicroStx
      ).length;

      // This assertion now PASSES - the fix ensures there are NO fees below minimum
      expect(feesBelowMinimum).toBe(0);
    });

    it('ensures proper fee ordering with minimum enforcement', () => {
      const extraLargeTxByteLength = 8000; // 8000 bytes
      const minimumFeeRequiredInMicroStx = extraLargeTxByteLength * 1; // 8000 µSTX minimum

      const allFeesTooLowEstimations = [
        { fee: 3000, fee_rate: 0 }, // 3000 µSTX - way below 8000 µSTX minimum
        { fee: 5000, fee_rate: 0 }, // 5000 µSTX - still below 8000 µSTX minimum
        { fee: 7000, fee_rate: 0 }, // 7000 µSTX - still below 8000 µSTX minimum
      ];

      const contractCallDefaultFeeEstimations = {
        low: { min: 2000, max: 4000 }, // Max 4000 µSTX - way below 8000 minimum
        standard: { min: 4000, max: 6000 }, // Max 6000 µSTX - still below 8000 minimum
        high: { min: 6000, max: 7500 }, // Max 7500 µSTX - STILL below 8000 minimum!
      };

      const result = parseStacksTxFeeEstimationResponse({
        feeEstimation: {
          cost_scalar_change_by_byte: 1,
          estimated_cost: {},
          estimated_cost_scalar: 1000,
          estimations: allFeesTooLowEstimations,
          error: undefined,
        },
        payloadType: PayloadType.ContractCall,
        maxValues: undefined,
        minValues: undefined,
        txByteLength: extraLargeTxByteLength,
        tokenTransferFeeEstimations: [],
        contractCallDefaultFeeEstimations,
        contractDeploymentDefaultFeeEstimations: undefined,
      });

      // All fees should meet the minimum requirement and be properly ordered
      const allFees = result.estimates.map(e => e.fee.amount.toNumber());
      const [lowFee, mediumFee, highFee] = allFees;

      // This assertion now PASSES - all fees meet the minimum requirement
      expect(lowFee).toBeGreaterThanOrEqual(minimumFeeRequiredInMicroStx);
      expect(mediumFee).toBeGreaterThanOrEqual(minimumFeeRequiredInMicroStx);
      expect(highFee).toBeGreaterThanOrEqual(minimumFeeRequiredInMicroStx);

      // Fees should be properly ordered: low <= medium <= high
      expect(mediumFee).toBeGreaterThan(lowFee);
    });
  });
});

describe(enforceContractCallMinimumFees.name, () => {
  it('does not modify fees for non-contract call transactions', () => {
    const feeEstimates = [
      { fee: createMoney(1000, 'STX'), feeRate: 0 },
      { fee: createMoney(2000, 'STX'), feeRate: 0 },
      { fee: createMoney(3000, 'STX'), feeRate: 0 },
    ];

    const result = enforceContractCallMinimumFees(feeEstimates, 5000, PayloadType.TokenTransfer);

    expect(result).toEqual(feeEstimates);
  });

  it('does not modify fees when txByteLength is null', () => {
    const feeEstimates = [
      { fee: createMoney(1000, 'STX'), feeRate: 0 },
      { fee: createMoney(2000, 'STX'), feeRate: 0 },
      { fee: createMoney(3000, 'STX'), feeRate: 0 },
    ];

    const result = enforceContractCallMinimumFees(feeEstimates, null, PayloadType.ContractCall);

    expect(result).toEqual(feeEstimates);
  });

  it('enforces minimum fees for contract calls', () => {
    const txByteLength = 4000; // 4000 bytes = 4000 µSTX minimum
    const feeEstimates = [
      { fee: createMoney(2000, 'STX'), feeRate: 0 }, // Below minimum
      { fee: createMoney(3000, 'STX'), feeRate: 0 }, // Below minimum
      { fee: createMoney(5000, 'STX'), feeRate: 0 }, // Above minimum
    ];

    const result = enforceContractCallMinimumFees(
      feeEstimates,
      txByteLength,
      PayloadType.ContractCall
    );

    // All fees should be at least 4000 µSTX
    expect(result[0].fee.amount.toNumber()).toBe(4000);
    expect(result[1].fee.amount.toNumber()).toBe(4500); // 4000 + 500 for proper ordering
    expect(result[2].fee.amount.toNumber()).toBe(5000); // Already above minimum
  });

  it('maintains proper fee ordering when all fees are below minimum', () => {
    const txByteLength = 6000; // 6000 bytes = 6000 µSTX minimum
    const feeEstimates = [
      { fee: createMoney(1000, 'STX'), feeRate: 0 },
      { fee: createMoney(2000, 'STX'), feeRate: 0 },
      { fee: createMoney(3000, 'STX'), feeRate: 0 },
    ];

    const result = enforceContractCallMinimumFees(
      feeEstimates,
      txByteLength,
      PayloadType.ContractCall
    );

    // All should be set to minimum or higher with proper ordering
    expect(result[0].fee.amount.toNumber()).toBe(6000); // Minimum
    expect(result[1].fee.amount.toNumber()).toBe(6500); // Minimum + 500
    expect(result[2].fee.amount.toNumber()).toBe(7000); // Minimum + 1000

    // Verify ordering
    expect(result[1].fee.amount.toNumber()).toBeGreaterThan(result[0].fee.amount.toNumber());
    expect(result[2].fee.amount.toNumber()).toBeGreaterThan(result[1].fee.amount.toNumber());
  });
});
