import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { DerivedAmounts, SwapInternalState } from '../swap-state.types';
import {
  createAccountSwapAsset,
  defaultBtcAsset,
  defaultStxAsset,
} from '../tests/test-utils/fixtures';
import { runValidation } from './swap-validation';

function createValidationContext({
  state,
  derivedAmounts,
}: {
  state: Partial<SwapInternalState>;
  derivedAmounts?: DerivedAmounts;
}) {
  const defaultState: SwapInternalState = {
    baseSwapAsset: null,
    targetSwapAsset: null,
    baseAmount: '0',
    slippage: 0.03,
    inputCurrencyMode: 'crypto',
    quoteCurrencyPreference: 'USD',
    quotePolicy: 'best',
    selectingAsset: null,
    nonceOverride: undefined,
    pairReconciliation: { base: 'pending', target: 'pending' },
    customFee: null,
    feeTier: 'standard',
  };

  return {
    state: { ...defaultState, ...state },
    derivedAmounts: derivedAmounts ?? { crypto: null, quote: null },
  };
}

describe('swap validation', () => {
  describe('amount validation', () => {
    describe('basic validation', () => {
      it('returns REQUIRED when amount is empty or whitespace', () => {
        const context = createValidationContext({
          state: { baseAmount: '' },
        });
        const result = runValidation(context);
        expect(result.issues.baseAmount).toEqual({ field: 'baseAmount', code: 'REQUIRED' });
        expect(result.isValid).toBe(false);
      });

      it.each(['abc', 'NaN', 'Infinity'])('returns INVALID when amount is %s', value => {
        const context = createValidationContext({ state: { baseAmount: value } });
        const result = runValidation(context);
        expect(result.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'INVALID',
        });
      });

      it('validates parsability before other checks', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: 'invalid',
          },
          derivedAmounts: {
            crypto: createMoney(1000, 'BTC', 8),
            quote: createMoney(50000, 'USD', 2),
          },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'INVALID',
        });
      });
    });

    describe('precision validation', () => {
      it('returns PRECISION_INVALID when decimals exceed asset limit', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '1.123456789',
          },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'PRECISION_INVALID',
          context: { decimals: 8 },
        });
      });

      it('allows exact decimal precision matching asset decimals', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '1.12345678',
          },
        });

        const result = runValidation(context);

        expect(result.issues.baseAmount).toBeUndefined();
      });

      it.each([
        { decimals: 0, validAmount: '123', invalidAmount: '123.1' },
        { decimals: 2, validAmount: '123.45', invalidAmount: '123.456' },
        { decimals: 6, validAmount: '123.456789', invalidAmount: '123.4567891' },
        { decimals: 8, validAmount: '123.12345678', invalidAmount: '123.123456789' },
        {
          decimals: 18,
          validAmount: '1.123456789012345678',
          invalidAmount: '1.1234567890123456789',
        },
      ])(
        'handles $decimals decimal precision correctly',
        ({ decimals, validAmount, invalidAmount }) => {
          const asset = createAccountSwapAsset({
            asset: { protocol: 'sip10', symbol: 'TEST', decimals },
            balance: { crypto: 1000, quote: 100 },
          });

          const validContext = createValidationContext({
            state: { baseSwapAsset: asset, baseAmount: validAmount },
          });
          const invalidContext = createValidationContext({
            state: { baseSwapAsset: asset, baseAmount: invalidAmount },
          });

          const validResult = runValidation(validContext);
          const invalidResult = runValidation(invalidContext);

          expect(validResult.issues.baseAmount).toBeUndefined();
          expect(invalidResult.issues.baseAmount).toEqual({
            field: 'baseAmount',
            code: 'PRECISION_INVALID',
            context: { decimals },
          });
        }
      );
    });

    describe('range validation', () => {
      it('returns TOO_SMALL for BTC below 546 satoshis (dust limit)', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '0.00000545',
          },
          derivedAmounts: {
            crypto: createMoney(545, 'BTC', 8),
            quote: createMoney(27, 'USD', 2),
          },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'TOO_SMALL',
          context: { minimum: createMoney(546, 'BTC', 8) },
        });
      });

      it('allows exactly 546 satoshis for BTC', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '0.00000546',
          },
          derivedAmounts: {
            crypto: createMoney(546, 'BTC', 8),
            quote: createMoney(27, 'USD', 2),
          },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toBeUndefined();
      });

      it('allows any positive amount for STX and SIP10 tokens', () => {
        const stxAsset = createAccountSwapAsset({
          asset: defaultStxAsset,
          balance: { crypto: 1000_000_000, quote: 1000_00 },
        });

        const sip10Asset = createAccountSwapAsset({
          asset: { protocol: 'sip10', symbol: 'TOKEN', decimals: 6 },
          balance: { crypto: 1000_000, quote: 100_00 },
        });

        const stxContext = createValidationContext({
          state: { baseSwapAsset: stxAsset, baseAmount: '0.000001' },
          derivedAmounts: {
            crypto: createMoney(1, 'STX', 6),
            quote: createMoney(0, 'USD', 2),
          },
        });

        const sip10Context = createValidationContext({
          state: { baseSwapAsset: sip10Asset, baseAmount: '0.000001' },
          derivedAmounts: {
            crypto: createMoney(1, 'TOKEN', 6),
            quote: createMoney(0, 'USD', 2),
          },
        });

        const stxResult = runValidation(stxContext);
        const sip10Result = runValidation(sip10Context);

        expect(stxResult.issues.baseAmount).toBeUndefined();
        expect(sip10Result.issues.baseAmount).toBeUndefined();
      });

      it('validates against crypto amounts regardless of input currency mode', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const cryptoModeContext = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '0.00000545',
            inputCurrencyMode: 'crypto',
          },
          derivedAmounts: {
            crypto: createMoney(545, 'BTC', 8),
            quote: createMoney(27, 'USD', 2),
          },
        });

        const quoteModeContext = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '27',
            inputCurrencyMode: 'quote',
          },
          derivedAmounts: {
            crypto: createMoney(545, 'BTC', 8),
            quote: createMoney(27, 'USD', 2),
          },
        });

        const cryptoResult = runValidation(cryptoModeContext);
        const quoteResult = runValidation(quoteModeContext);

        expect(cryptoResult.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'TOO_SMALL',
          context: { minimum: createMoney(546, 'BTC', 8) },
        });
        expect(quoteResult.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'TOO_SMALL',
          context: { minimum: createMoney(546, 'BTC', 8) },
        });
      });
    });

    describe('balance validation', () => {
      it('returns INSUFFICIENT_BALANCE when exceeding available balance', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '1.5',
            inputCurrencyMode: 'crypto',
          },
          derivedAmounts: {
            crypto: createMoney(150_000_000, 'BTC', 8),
            quote: createMoney(75_000_00, 'USD', 2),
          },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'INSUFFICIENT_BALANCE',
          context: { balance: createMoney(100_000_000, 'BTC', 8) },
        });
      });

      it('allows amount equal to available balance', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '1',
            inputCurrencyMode: 'crypto',
          },
          derivedAmounts: {
            crypto: createMoney(100_000_000, 'BTC', 8),
            quote: createMoney(50_000_00, 'USD', 2),
          },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toBeUndefined();
      });
    });

    describe('validation with incomplete context', () => {
      it('skips range/balance checks when derivedAmounts is null', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '0.00000001',
          },
          derivedAmounts: { crypto: null, quote: null },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toBeUndefined();
        expect(result.issues.baseAmount).toBeUndefined();
      });

      it('skips range/balance checks when baseSwapAsset is null', () => {
        const context = createValidationContext({
          state: {
            baseSwapAsset: null,
            baseAmount: '0.00000001',
          },
          derivedAmounts: {
            crypto: createMoney(1, 'BTC', 8),
            quote: createMoney(50, 'USD', 2),
          },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toBeUndefined();
        expect(result.issues.baseAmount).toBeUndefined();
      });

      it('still validates parsability and presence without full context', () => {
        const context = createValidationContext({
          state: {
            baseSwapAsset: null,
            baseAmount: 'invalid',
          },
          derivedAmounts: { crypto: null, quote: null },
        });

        const result = runValidation(context);
        expect(result.issues.baseAmount).toEqual({
          field: 'baseAmount',
          code: 'INVALID',
        });
      });
    });
  });

  describe('slippage validation', () => {
    it('returns REQUIRED when slippage is null or undefined', () => {
      const context = createValidationContext({
        state: { slippage: null as unknown as number },
      });

      const result = runValidation(context);
      expect(result.issues.slippage).toEqual({
        field: 'slippage',
        code: 'REQUIRED',
      });
    });

    it('returns OUT_OF_RANGE when below 0.005 (0.5%) or above 0.1 (10%)', () => {
      const tooLow = createValidationContext({ state: { slippage: 0.004 } });
      const tooHigh = createValidationContext({ state: { slippage: 0.11 } });

      const lowResult = runValidation(tooLow);
      const highResult = runValidation(tooHigh);

      expect(lowResult.issues.slippage).toEqual({
        field: 'slippage',
        code: 'OUT_OF_RANGE',
        context: { min: 0.005, max: 0.1 },
      });
      expect(highResult.issues.slippage).toEqual({
        field: 'slippage',
        code: 'OUT_OF_RANGE',
        context: { min: 0.005, max: 0.1 },
      });
    });

    it('allows boundary values exactly (0.005 and 0.1)', () => {
      const minContext = createValidationContext({ state: { slippage: 0.005 } });
      const maxContext = createValidationContext({ state: { slippage: 0.1 } });

      const minResult = runValidation(minContext);
      const maxResult = runValidation(maxContext);

      expect(minResult.issues.slippage).toBeUndefined();
      expect(maxResult.issues.slippage).toBeUndefined();
    });
  });

  describe('asset selection validation', () => {
    it('invalid when baseSwapAsset is missing', () => {
      const context = createValidationContext({
        state: { baseSwapAsset: null },
      });

      const result = runValidation(context);
      expect(result.issues.baseSwapAsset).toEqual({
        field: 'baseSwapAsset',
        code: 'REQUIRED',
      });
    });

    it('invalid when targetSwapAsset is missing', () => {
      const context = createValidationContext({
        state: { targetSwapAsset: null },
      });

      const result = runValidation(context);
      expect(result.issues.targetSwapAsset).toEqual({
        field: 'targetSwapAsset',
        code: 'REQUIRED',
      });
    });

    it('invalid when both assets are missing', () => {
      const context = createValidationContext({
        state: { baseSwapAsset: null, targetSwapAsset: null },
      });

      const result = runValidation(context);
      expect(result.issues.baseSwapAsset).toEqual({
        field: 'baseSwapAsset',
        code: 'REQUIRED',
      });
      expect(result.issues.targetSwapAsset).toEqual({
        field: 'targetSwapAsset',
        code: 'REQUIRED',
      });
    });
  });

  describe('combined validation', () => {
    describe('issue aggregation', () => {
      it('collects all issues from all validators', () => {
        const context = createValidationContext({
          state: {
            baseSwapAsset: null,
            targetSwapAsset: null,
            baseAmount: '',
            slippage: null as unknown as number,
          },
        });

        const result = runValidation(context);

        expect(result.issues.baseSwapAsset).toEqual({ field: 'baseSwapAsset', code: 'REQUIRED' });
        expect(result.issues.targetSwapAsset).toEqual({
          field: 'targetSwapAsset',
          code: 'REQUIRED',
        });
        expect(result.issues.baseAmount).toEqual({ field: 'baseAmount', code: 'REQUIRED' });
        expect(result.issues.slippage).toEqual({ field: 'slippage', code: 'REQUIRED' });
      });

      it('returns issues object with no values when valid', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const stxAsset = createAccountSwapAsset({
          asset: defaultStxAsset,
          balance: { crypto: 1000_000_000, quote: 1000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            targetSwapAsset: stxAsset,
            baseAmount: '0.5',
            slippage: 0.03,
          },
          derivedAmounts: {
            crypto: createMoney(50_000_000, 'BTC', 8),
            quote: createMoney(25_000_00, 'USD', 2),
          },
        });

        const result = runValidation(context);
        expect(result.issues).toEqual({
          baseSwapAsset: undefined,
          targetSwapAsset: undefined,
          baseAmount: undefined,
          slippage: undefined,
        });
      });
    });

    describe('byField grouping', () => {
      it('groups issues by field correctly', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            targetSwapAsset: null,
            baseAmount: '2.123456789',
            slippage: 0.004,
          },
          derivedAmounts: {
            crypto: createMoney(212345678, 'BTC', 8),
            quote: createMoney(106172839, 'USD', 2),
          },
        });

        const result = runValidation(context);

        expect(result.issues.baseAmount?.field === 'baseAmount').toBe(true);
        expect(result.issues.targetSwapAsset?.field === 'targetSwapAsset').toBe(true);
        expect(result.issues.slippage?.field === 'slippage').toBe(true);
      });

      it('maintains type safety for field-specific issue codes', () => {
        const context = createValidationContext({
          state: {
            baseAmount: '',
            slippage: null as unknown as number,
          },
        });

        const result = runValidation(context);

        const baseAmountIssue = result.issues.baseAmount;
        const slippageIssue = result.issues.slippage;

        if (baseAmountIssue) {
          expect([
            'REQUIRED',
            'TOO_LARGE',
            'TOO_SMALL',
            'INVALID',
            'PRECISION_INVALID',
            'INSUFFICIENT_BALANCE',
          ]).toContain(baseAmountIssue.code);
        }

        if (slippageIssue) {
          expect(['REQUIRED', 'INVALID', 'OUT_OF_RANGE']).toContain(slippageIssue.code);
        }
      });
    });

    describe('isValid flag', () => {
      it('returns true only when no issues exist', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const stxAsset = createAccountSwapAsset({
          asset: defaultStxAsset,
          balance: { crypto: 1000_000_000, quote: 1000_00 },
        });

        const validContext = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            targetSwapAsset: stxAsset,
            baseAmount: '0.5',
            slippage: 0.03,
          },
          derivedAmounts: {
            crypto: createMoney(50_000_000, 'BTC', 8),
            quote: createMoney(25_000_00, 'USD', 2),
          },
        });

        const result = runValidation(validContext);
        expect(result.isValid).toBe(true);
        expect(result.issues).toEqual({
          baseSwapAsset: undefined,
          targetSwapAsset: undefined,
          baseAmount: undefined,
          slippage: undefined,
        });
      });

      it.each([
        { state: { baseAmount: '' }, description: 'empty amount' },
        { state: { baseSwapAsset: null }, description: 'null baseSwapAsset' },
        { state: { targetSwapAsset: null }, description: 'null targetSwapAsset' },
        { state: { slippage: 0.004 }, description: 'invalid slippage' },
      ])('returns false when $description', ({ state }) => {
        const context = createValidationContext({ state });
        const result = runValidation(context);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('type narrowing', () => {
    describe('baseAmount issue context narrowing', () => {
      it('narrows PRECISION_INVALID to include decimals context', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '1.123456789',
          },
        });

        const result = runValidation(context);
        const issue = result.issues.baseAmount;

        if (issue?.code === 'PRECISION_INVALID') {
          expect(issue.context.decimals).toBe(8);
          expect(typeof issue.context.decimals).toBe('number');
        } else {
          throw new Error('Expected PRECISION_INVALID issue');
        }
      });

      it('narrows TOO_SMALL to include minimum context', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '0.00000545',
          },
          derivedAmounts: {
            crypto: createMoney(545, 'BTC', 8),
            quote: createMoney(27, 'USD', 2),
          },
        });

        const result = runValidation(context);
        const issue = result.issues.baseAmount;

        if (issue?.code === 'TOO_SMALL') {
          expect(issue.context.minimum).toBeDefined();
          expect(issue.context.minimum.symbol).toBe('BTC');
          expect(issue.context.minimum.amount.toNumber()).toBe(546);
        } else {
          throw new Error('Expected TOO_SMALL issue');
        }
      });

      it('narrows INSUFFICIENT_BALANCE to include balance context', () => {
        const btcAsset = createAccountSwapAsset({
          asset: defaultBtcAsset,
          balance: { crypto: 100_000_000, quote: 50_000_00 },
        });

        const context = createValidationContext({
          state: {
            baseSwapAsset: btcAsset,
            baseAmount: '1.5',
            inputCurrencyMode: 'crypto',
          },
          derivedAmounts: {
            crypto: createMoney(150_000_000, 'BTC', 8),
            quote: createMoney(75_000_00, 'USD', 2),
          },
        });

        const result = runValidation(context);
        const issue = result.issues.baseAmount;

        if (issue?.code === 'INSUFFICIENT_BALANCE') {
          expect(issue.context.balance).toBeDefined();
          expect(issue.context.balance.symbol).toBe('BTC');
          expect(issue.context.balance.amount.toNumber()).toBe(100_000_000);
        } else {
          throw new Error('Expected INSUFFICIENT_BALANCE issue');
        }
      });

      it('REQUIRED and INVALID issues do not have context', () => {
        const requiredContext = createValidationContext({
          state: { baseAmount: '' },
        });

        const invalidContext = createValidationContext({
          state: { baseAmount: 'invalid' },
        });

        const requiredResult = runValidation(requiredContext);
        const invalidResult = runValidation(invalidContext);

        const requiredIssue = requiredResult.issues.baseAmount;
        const invalidIssue = invalidResult.issues.baseAmount;

        if (requiredIssue?.code === 'REQUIRED') {
          expect('context' in requiredIssue).toBe(false);
        }

        if (invalidIssue?.code === 'INVALID') {
          expect('context' in invalidIssue).toBe(false);
        }
      });
    });

    describe('slippage issue context narrowing', () => {
      it('narrows OUT_OF_RANGE to include min/max context', () => {
        const context = createValidationContext({ state: { slippage: 0.004 } });
        const result = runValidation(context);
        const issue = result.issues.slippage;

        if (issue?.code === 'OUT_OF_RANGE') {
          expect(issue.context.min).toBe(0.005);
          expect(issue.context.max).toBe(0.1);
          expect(typeof issue.context.min).toBe('number');
          expect(typeof issue.context.max).toBe('number');
        } else {
          throw new Error('Expected OUT_OF_RANGE issue');
        }
      });

      it('REQUIRED issue does not have context', () => {
        const context = createValidationContext({
          state: { slippage: null as unknown as number },
        });

        const result = runValidation(context);
        const issue = result.issues.slippage;

        if (issue?.code === 'REQUIRED') {
          expect('context' in issue).toBe(false);
        }
      });
    });

    describe('cross-field type safety', () => {
      it('each field has properly typed issues', () => {
        const context = createValidationContext({
          state: {
            baseSwapAsset: null,
            targetSwapAsset: null,
            baseAmount: '',
            slippage: null as unknown as number,
          },
        });

        const result = runValidation(context);

        const baseSwapAssetIssue = result.issues.baseSwapAsset;
        const targetSwapAssetIssue = result.issues.targetSwapAsset;
        const baseAmountIssue = result.issues.baseAmount;
        const slippageIssue = result.issues.slippage;

        if (baseSwapAssetIssue) {
          expect(baseSwapAssetIssue.field).toBe('baseSwapAsset');
          expect(baseSwapAssetIssue.code).toBe('REQUIRED');
        }

        if (targetSwapAssetIssue) {
          expect(targetSwapAssetIssue.field).toBe('targetSwapAsset');
          expect(targetSwapAssetIssue.code).toBe('REQUIRED');
        }

        if (baseAmountIssue) {
          expect(baseAmountIssue.field).toBe('baseAmount');
          expect([
            'REQUIRED',
            'INVALID',
            'PRECISION_INVALID',
            'TOO_SMALL',
            'TOO_LARGE',
            'INSUFFICIENT_BALANCE',
          ]).toContain(baseAmountIssue.code);
        }

        if (slippageIssue) {
          expect(slippageIssue.field).toBe('slippage');
          expect(['REQUIRED', 'INVALID', 'OUT_OF_RANGE']).toContain(slippageIssue.code);
        }
      });
    });
  });
});
