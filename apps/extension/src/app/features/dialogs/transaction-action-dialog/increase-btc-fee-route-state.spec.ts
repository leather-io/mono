import { beforeEach, describe, expect, test, vi } from 'vitest';

import { logger } from '@shared/logger';

import { increaseBtcFeeRouteStateSchema } from './increase-btc-fee-route-state';

vi.mock('@shared/logger', () => ({
  logger: { warn: vi.fn() },
}));

const p2wpkhOutput = {
  scriptpubkey: '0014e8df018c7e326cc253faac7e46cdc51e68542c42',
  scriptpubkey_asm: 'OP_0 OP_PUSHBYTES_20 e8df018c7e326cc253faac7e46cdc51e68542c42',
  scriptpubkey_type: 'v0_p2wpkh',
  scriptpubkey_address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  value: 50_000,
};

const legacyInput = {
  is_coinbase: false,
  prevout: {
    scriptpubkey: '76a914c825a1ecf2a6830c4401620c3a16f1995057c2ab88ac',
    scriptpubkey_asm:
      'OP_DUP OP_HASH160 OP_PUSHBYTES_20 c825a1ecf2a6830c4401620c3a16f1995057c2ab OP_EQUALVERIFY OP_CHECKSIG',
    scriptpubkey_type: 'p2pkh',
    scriptpubkey_address: '1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY',
    value: 100_000,
  },
  scriptsig: '4830450221',
  scriptsig_asm: 'OP_PUSHBYTES_72 30450221',
  sequence: 4294967293,
  txid: 'b'.repeat(64),
  vout: 0,
};

function makeRouteState(vout: unknown[]) {
  return {
    btcTx: {
      fee: 1_000,
      locktime: 0,
      size: 200,
      status: { confirmed: false },
      txid: 'a'.repeat(64),
      version: 2,
      vin: [legacyInput],
      vout,
      weight: 800,
    },
  };
}

describe('increaseBtcFeeRouteStateSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('reads a transaction whose legacy input has no witness', () => {
    const state = increaseBtcFeeRouteStateSchema.parse(makeRouteState([p2wpkhOutput]));

    expect(state?.btcTx.vin[0]?.witness).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('logs and returns null for a transaction with an OP_RETURN output', () => {
    const opReturnOutput = {
      scriptpubkey: '6a0568656c6c6f',
      scriptpubkey_asm: 'OP_RETURN OP_PUSHBYTES_5 68656c6c6f',
      scriptpubkey_type: 'op_return',
      value: 0,
    };

    expect(
      increaseBtcFeeRouteStateSchema.parse(makeRouteState([p2wpkhOutput, opReturnOutput]))
    ).toBeNull();
    expect(logger.warn).toHaveBeenCalledOnce();
  });

  test('returns null without logging when there is no route state', () => {
    expect(increaseBtcFeeRouteStateSchema.parse(null)).toBeNull();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
