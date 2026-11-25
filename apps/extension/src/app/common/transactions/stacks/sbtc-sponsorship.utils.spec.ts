import { STACKS_MAINNET } from '@stacks/network';
import { AuthType, bufferCV, serializeCV, tupleCV, uintCV } from '@stacks/transactions';
import { describe, expect, test } from 'vitest';

import { FeeTypes } from '@leather.io/models';
import { LeatherApiError } from '@leather.io/services';
import {
  type StacksUnsignedContractCallOptions,
  TransactionTypes,
  generateStacksUnsignedTransaction,
  getSbtcSponsoredTransferDetails,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import {
  generateSbtcSponsoredCallTransactions,
  getSbtcSponsoredCallBudgetSats,
  getSbtcSponsorshipFeeSats,
  getSbtcSponsorshipFeeTier,
  getSbtcSponsorshipRefusalAction,
  isSbtcSponsorableContractCall,
} from './sbtc-sponsorship.utils';

const quote = { satsPerStx: '512.5', minFeeSats: 1000, maxFeeSats: 50_000 };

describe(getSbtcSponsorshipFeeSats.name, () => {
  test('converts the micro-STX fee at the quoted rate, rounding up', () => {
    expect(getSbtcSponsorshipFeeSats(3_000_000, quote)).toBe(1538);
  });

  test('accepts the fee as a string', () => {
    expect(getSbtcSponsorshipFeeSats('3000000', quote)).toBe(1538);
  });

  test('clamps a fee below the quote minimum up to the minimum', () => {
    expect(getSbtcSponsorshipFeeSats(500, quote)).toBe(quote.minFeeSats);
  });

  test('clamps a fee above the quote maximum down to the maximum', () => {
    expect(getSbtcSponsorshipFeeSats(1_000_000_000, quote)).toBe(quote.maxFeeSats);
  });
});

describe(getSbtcSponsorshipFeeTier.name, () => {
  test('maps the form fee types to the STX fee estimate tiers', () => {
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Low])).toBe('low');
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Middle])).toBe('standard');
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.High])).toBe('high');
  });

  test('falls back to the standard tier for custom or unknown fee types', () => {
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Custom])).toBe('standard');
    expect(getSbtcSponsorshipFeeTier(FeeTypes[FeeTypes.Unknown])).toBe('standard');
  });
});

const sender = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const publicKey = '03ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab';
const feeRecipient = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const sbtcContractId = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';

function createCallOptions(functionArgs: string[] = []): StacksUnsignedContractCallOptions {
  return {
    txType: TransactionTypes.ContractCall,
    contractAddress: 'SP000000000000000000002Q6VF78',
    contractName: 'bns',
    functionName: 'name-transfer',
    functionArgs,
    fee: createMoney(3_000_000, 'STX'),
    nonce: 7,
    publicKey,
    network: STACKS_MAINNET,
  };
}

describe(getSbtcSponsoredCallBudgetSats.name, () => {
  test('prices the STX fee at the quoted rate and adds the minimum fee', () => {
    expect(getSbtcSponsoredCallBudgetSats(3_000_000, quote)).toBe(1538 + quote.minFeeSats);
  });

  test('caps the budget at the quote maximum', () => {
    expect(getSbtcSponsoredCallBudgetSats(1_000_000_000, quote)).toBe(quote.maxFeeSats);
  });
});

describe(generateSbtcSponsoredCallTransactions.name, () => {
  const paymentNonce = 7;

  async function generate() {
    return generateSbtcSponsoredCallTransactions({
      callOptions: createCallOptions(),
      contractId: sbtcContractId,
      sender,
      publicKey,
      network: STACKS_MAINNET,
      quote: { ...quote, feeRecipientPrincipal: feeRecipient },
      stxFeeMicro: 3_000_000,
      nonce: paymentNonce,
    });
  }

  test('pays the budget then the fee entry, both to the fee recipient', async () => {
    const { paymentTx } = await generate();

    expect(getSbtcSponsoredTransferDetails(paymentTx)).toMatchObject({
      contractId: sbtcContractId,
      sender,
      recipient: feeRecipient,
      feeRecipient,
      amount: BigInt(getSbtcSponsoredCallBudgetSats(3_000_000, quote)),
      feeAmount: BigInt(getSbtcSponsorshipFeeSats(3_000_000, quote)),
    });
  });

  test('puts the payment at nonce N and the call at N+1', async () => {
    const { paymentTx, callTx } = await generate();

    expect(paymentTx.auth.spendingCondition.nonce).toBe(BigInt(paymentNonce));
    expect(callTx.auth.spendingCondition.nonce).toBe(BigInt(paymentNonce + 1));
  });

  test('builds the call as sponsored with a zero fee', async () => {
    const { callTx } = await generate();

    expect(callTx.auth.authType).toBe(AuthType.Sponsored);
    expect(callTx.auth.spendingCondition.fee).toBe(0n);
  });
});

describe(isSbtcSponsorableContractCall.name, () => {
  async function isSponsorable(functionArgs: string[]) {
    return isSbtcSponsorableContractCall(
      await generateStacksUnsignedTransaction({
        ...createCallOptions(functionArgs),
        sponsored: true,
      })
    );
  }

  test('accepts a call with tuple keys in byte order', async () => {
    expect(await isSponsorable([serializeCV(tupleCV({ a: uintCV(1), b: uintCV(2) }))])).toBe(true);
  });

  test('rejects a tuple whose keys sort differently by byte and by locale', async () => {
    expect(await isSponsorable([serializeCV(tupleCV({ B: uintCV(1), a: uintCV(2) }))])).toBe(false);
  });

  test('rejects a call over 16,384 bytes', async () => {
    expect(await isSponsorable([serializeCV(bufferCV(new Uint8Array(16_384)))])).toBe(false);
  });
});

describe(getSbtcSponsorshipRefusalAction.name, () => {
  function createRefusal(status: number, code?: string, reason?: string) {
    return new LeatherApiError('url', status, 'refused', { error: 'refused', code, reason });
  }
  const forCall = { awaitsPayment: true };
  const forPayment = { awaitsPayment: false };

  test('retries a call while its payment is not visible yet', () => {
    expect(getSbtcSponsorshipRefusalAction(createRefusal(409, 'stale_nonce'), forCall)).toBe(
      'retry'
    );
    expect(
      getSbtcSponsorshipRefusalAction(
        createRefusal(422, 'not_eligible', 'payment_not_confirmed'),
        forCall
      )
    ).toBe('retry');
  });

  test('stops a payment on a stale nonce', () => {
    expect(getSbtcSponsorshipRefusalAction(createRefusal(409, 'stale_nonce'), forPayment)).toBe(
      'stop'
    );
  });

  test.each(['funding_pending', 'upstream_unavailable', 'broadcast_failed'])(
    'retries %s for a payment and for a call',
    code => {
      expect(getSbtcSponsorshipRefusalAction(createRefusal(502, code), forPayment)).toBe('retry');
      expect(getSbtcSponsorshipRefusalAction(createRefusal(502, code), forCall)).toBe('retry');
    }
  );

  test('retries when no answer arrived or the gateway failed without a code', () => {
    expect(getSbtcSponsorshipRefusalAction(new TypeError('Failed to fetch'), forCall)).toBe(
      'retry'
    );
    expect(getSbtcSponsorshipRefusalAction(createRefusal(500), forCall)).toBe('retry');
  });

  test('asks for a fresh quote when the quote expired', () => {
    expect(getSbtcSponsorshipRefusalAction(createRefusal(410, 'quote_expired'), forCall)).toBe(
      'requote'
    );
  });

  test('stops on any other refusal', () => {
    expect(
      getSbtcSponsorshipRefusalAction(
        createRefusal(422, 'not_eligible', 'payment_mismatch'),
        forCall
      )
    ).toBe('stop');
    expect(getSbtcSponsorshipRefusalAction(createRefusal(400), forCall)).toBe('stop');
  });
});
