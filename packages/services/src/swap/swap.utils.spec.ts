import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import type { StacksContractCallSwapExecutionData } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { hasValidMinReceiveAmountPostCondition } from './swap.utils';

function makeExecutionData(
  targetAsset: { protocol: string; assetId?: string },
  targetAmount: { amount: string; symbol: string; decimals: number },
  postConditions: unknown[]
): StacksContractCallSwapExecutionData {
  return {
    executionType: 'stacks-contract-call',
    providerId: 'bitflow-bff-api',
    contractAddress: 'SP000',
    contractName: 'swap-router',
    functionName: 'swap',
    functionArgs: [],
    postConditions,
    quote: {
      providerId: 'bitflow-bff-api',
      executionType: 'stacks-contract-call',
      providerQuoteData: {},
      baseAsset: { protocol: 'nativeStx', symbol: 'STX', decimals: 6 },
      targetAsset,
      baseAmount: createMoney(1000000, 'STX', 6),
      targetAmount: createMoney(
        new BigNumber(targetAmount.amount),
        targetAmount.symbol,
        targetAmount.decimals
      ),
      dexPath: [],
      assetPath: [],
      isExecutable: true,
      executionConstraints: [],
      createdAt: new Date(),
    },
  } as unknown as StacksContractCallSwapExecutionData;
}

const sip10Target = {
  protocol: 'sip10',
  assetId: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token',
};

const stxTarget = { protocol: 'nativeStx' };

describe(hasValidMinReceiveAmountPostCondition.name, () => {
  describe('single post condition', () => {
    it('returns true when single gte post condition matches target amount within tolerance', () => {
      // targetAmount = 1000000, slippage = 4% → minReceive = 960000
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '1000000', symbol: 'USDCx', decimals: 6 },
        [
          {
            type: 'ft-postcondition',
            address: 'SP000.pool',
            condition: 'gte',
            amount: '960000',
            asset: sip10Target.assetId,
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(true);
    });

    it('returns true for STX target with stx-postcondition', () => {
      // targetAmount = 5000000, slippage = 4% → minReceive = 4800000
      const executionData = makeExecutionData(
        stxTarget,
        { amount: '5000000', symbol: 'STX', decimals: 6 },
        [
          {
            type: 'stx-postcondition',
            address: 'SP000.pool',
            condition: 'gte',
            amount: '4800000',
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(true);
    });

    it('returns false when no gte post condition exists for target asset', () => {
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '1000000', symbol: 'USDCx', decimals: 6 },
        [
          {
            type: 'ft-postcondition',
            address: 'SP000',
            condition: 'lte',
            amount: '500000',
            asset: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(false);
    });

    it('returns false when gte amount is below min threshold', () => {
      // targetAmount = 1000000, slippage = 4% → minReceive = 960000, threshold = 959990
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '1000000', symbol: 'USDCx', decimals: 6 },
        [
          {
            type: 'ft-postcondition',
            address: 'SP000.pool',
            condition: 'gte',
            amount: '900000',
            asset: sip10Target.assetId,
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(false);
    });
  });

  describe('split-route post conditions', () => {
    it('returns true when multiple gte post conditions sum to meet threshold', () => {
      // targetAmount = 33735448, slippage = 4% → minReceive = 32386029
      // Split: 3429384 + 29294000 = 32723384 (> 32386029)
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '33735448', symbol: 'USDCx', decimals: 6 },
        [
          {
            type: 'ft-postcondition',
            address: 'SP000',
            condition: 'lte',
            amount: '50990',
            asset: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
          },
          {
            type: 'ft-postcondition',
            address: 'SP000.pool-1',
            condition: 'gte',
            amount: '3429384',
            asset: sip10Target.assetId,
          },
          {
            type: 'ft-postcondition',
            address: 'SP000.pool-2',
            condition: 'gte',
            amount: '29294000',
            asset: sip10Target.assetId,
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(true);
    });

    it('returns false when split post conditions sum below threshold', () => {
      // targetAmount = 33735448, slippage = 4% → minReceive = 32386029
      // Split: 1000000 + 2000000 = 3000000 (< 32386029)
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '33735448', symbol: 'USDCx', decimals: 6 },
        [
          {
            type: 'ft-postcondition',
            address: 'SP000.pool-1',
            condition: 'gte',
            amount: '1000000',
            asset: sip10Target.assetId,
          },
          {
            type: 'ft-postcondition',
            address: 'SP000.pool-2',
            condition: 'gte',
            amount: '2000000',
            asset: sip10Target.assetId,
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(false);
    });

    it('ignores non-matching gte post conditions when summing', () => {
      // Only the USDCx gte PCs should count, not the sBTC lte or other assets
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '1000000', symbol: 'USDCx', decimals: 6 },
        [
          {
            type: 'ft-postcondition',
            address: 'SP000',
            condition: 'lte',
            amount: '50000',
            asset: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
          },
          {
            type: 'ft-postcondition',
            address: 'SP000',
            condition: 'gte',
            amount: '99999999',
            asset: 'SOME_OTHER_TOKEN::token',
          },
          {
            type: 'ft-postcondition',
            address: 'SP000.pool-1',
            condition: 'gte',
            amount: '500000',
            asset: sip10Target.assetId,
          },
          {
            type: 'ft-postcondition',
            address: 'SP000.pool-2',
            condition: 'gte',
            amount: '460000',
            asset: sip10Target.assetId,
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('returns false when post conditions array is empty', () => {
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '1000000', symbol: 'USDCx', decimals: 6 },
        []
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(false);
    });

    it('returns true when amount exceeds min receive (more protective)', () => {
      // targetAmount = 1000000, slippage = 4% → minReceive = 960000
      // PC amount is higher than expected (tighter slippage from API)
      const executionData = makeExecutionData(
        sip10Target,
        { amount: '1000000', symbol: 'USDCx', decimals: 6 },
        [
          {
            type: 'ft-postcondition',
            address: 'SP000.pool',
            condition: 'gte',
            amount: '970000',
            asset: sip10Target.assetId,
          },
        ]
      );
      expect(hasValidMinReceiveAmountPostCondition(executionData, new BigNumber(0.04))).toBe(true);
    });
  });
});
