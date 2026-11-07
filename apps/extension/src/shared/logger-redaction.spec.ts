import { redactLogArgs, redactLogMessage } from './logger-redaction';

const nativeSegwitAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
const taprootAddress = 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297';
const legacyAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
const stacksAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const txid = 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16';
const publicKey = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const privateKey = 'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35';
const xpub =
  'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz';
const fingerprint = 'a1b2c3d4';
const descriptor = `wpkh([${fingerprint}/84'/0'/0']${xpub}/0/*)`;
const psbtHex =
  '70736274ff01007102000000011b6d2f1e4c33b4c1d3a5f1f1e0b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1000000000000ffffffff0200e1f505000000001600141d0f172a0ecb48aee1be1f2687d2963ae33f71a1';
const psbtBase64 = 'cHNidP8BAHECAAAAARttLx5MM7TB06Xx8eC4p8bV5POisQ==';
const mnemonic =
  'abandon ability able about above absent absorb abstract absurd abuse access accident';

const coinSelection = {
  inputs: [
    { address: nativeSegwitAddress, txid, vout: 0, value: 10_000 },
    { address: taprootAddress, txid, vout: 1, value: 20_000 },
  ],
  outputs: [{ address: legacyAddress, value: 25_000 }, { value: 4_000 }],
  fee: 1_000,
  inputCount: 2,
};

const signPsbtRequest = {
  jsonrpc: '2.0',
  id: 'abc-123',
  method: 'signPsbt',
  params: {
    hex: psbtHex,
    psbt: psbtBase64,
    account: 0,
    signAtIndex: [0, 1],
    broadcast: false,
  },
};

function createAxiosLikeError() {
  return Object.assign(new Error(`Request failed for ${stacksAddress}`), {
    config: {
      url: 'https://api.hiro.so/v2/transactions',
      method: 'post',
      data: JSON.stringify({ tx: psbtHex, sender: stacksAddress }),
    },
    response: { status: 400, data: { txid, reason: 'BadNonce' } },
  });
}

function serialize(value: unknown) {
  return JSON.stringify(value);
}

describe(redactLogArgs.name, () => {
  it('redacts nested addresses, txids, PSBT hex, xpubs and descriptors', () => {
    const [redacted] = redactLogArgs([
      {
        wallet: {
          accounts: [
            {
              receive: nativeSegwitAddress,
              stx: stacksAddress,
              legacy: legacyAddress,
              note: `sent ${txid}:0 to ${taprootAddress}`,
            },
          ],
          keychain: { extended: xpub, scanDescriptor: descriptor },
          payload: psbtHex,
          base64: psbtBase64,
        },
      },
    ]);
    const output = serialize(redacted);

    for (const secret of [
      nativeSegwitAddress,
      taprootAddress,
      legacyAddress,
      stacksAddress,
      txid,
      xpub,
      descriptor,
      psbtHex,
      psbtBase64,
      fingerprint,
    ]) {
      expect(output).not.toContain(secret);
    }
    expect(output).toContain('[redacted]');
  });

  it('redacts a signPsbt RPC request while keeping the method and id', () => {
    const [redacted] = redactLogArgs([signPsbtRequest]);
    const output = serialize(redacted);

    expect(output).not.toContain(psbtHex);
    expect(output).not.toContain(psbtBase64);
    expect(redacted).toMatchObject({ id: 'abc-123', method: 'signPsbt' });
  });

  it('redacts an Error carrying config.data and response', () => {
    const [redacted] = redactLogArgs([createAxiosLikeError()]);
    const output = serialize(redacted);

    expect(output).not.toContain(stacksAddress);
    expect(output).not.toContain(psbtHex);
    expect(output).not.toContain(txid);
    expect(redacted).toMatchObject({
      name: 'Error',
      message: 'Request failed for [redacted]',
      config: { method: 'post' },
      response: { status: 400, data: { reason: 'BadNonce' } },
    });
  });

  it('redacts mnemonic-shaped and private-key-shaped values', () => {
    const [redacted] = redactLogArgs([
      { phrase: mnemonic, mnemonic, value: privateKey, privateKey, password: 'hunter2' },
    ]);
    const output = serialize(redacted);

    expect(output).not.toContain(mnemonic);
    expect(output).not.toContain('abandon ability');
    expect(output).not.toContain(privateKey);
    expect(output).not.toContain('hunter2');
  });

  it('redacts public keys', () => {
    const [redacted] = redactLogArgs([{ publicKey, other: { key: publicKey }, text: publicKey }]);

    expect(serialize(redacted)).not.toContain(publicKey);
  });

  it('redacts fingerprints by key, in key origins and in messages', () => {
    const [redacted] = redactLogArgs([
      { fingerprint, keyOrigin: `${fingerprint}/84'/0'/0'`, path: `[${fingerprint}/84'/0'/0']` },
    ]);

    expect(serialize(redacted)).not.toContain(fingerprint);
    expect(
      redactLogMessage(`Successfully migrated Ledger fingerprint: 00000000 → ${fingerprint}`)
    ).toBe('Successfully migrated Ledger fingerprint: [redacted] → [redacted]');
  });

  it('collapses UTXO arrays to a count', () => {
    const [selection, utxoLog] = redactLogArgs([
      coinSelection,
      { utxos: [1, 2, 3], outpoints: ['a', 'b'] },
    ]);

    expect(selection).toEqual({
      inputs: '[2 items]',
      outputs: '[2 items]',
      fee: 1_000,
      inputCount: 2,
    });
    expect(utxoLog).toEqual({ utxos: '[3 items]', outpoints: '[2 items]' });
  });

  it('does not mutate the caller input', () => {
    const input = structuredClone(coinSelection);
    const error = createAxiosLikeError();
    const errorConfigData = error.config.data;

    redactLogArgs([input, error]);

    expect(input).toEqual(coinSelection);
    expect(error.config.data).toBe(errorConfigData);
    expect(error.message).toBe(`Request failed for ${stacksAddress}`);
  });

  it('keeps fee, counts and method readable', () => {
    expect(
      redactLogArgs([
        { fee: 1_000, inputCount: 2, outputCount: 3, totalInputValue: 30_000, method: 'signPsbt' },
        'plain text',
        42,
      ])
    ).toEqual([
      { fee: 1_000, inputCount: 2, outputCount: 3, totalInputValue: 30_000, method: 'signPsbt' },
      'plain text',
      42,
    ]);
  });

  it('handles circular references', () => {
    const circular: Record<string, unknown> = { method: 'getAddresses' };
    circular.self = circular;

    expect(redactLogArgs([circular])).toEqual([{ method: 'getAddresses', self: '[circular]' }]);
  });

  it('redacts capitalised and comma-separated mnemonics', () => {
    const capitalised = `Abandon ${mnemonic.split(' ').slice(1).join(' ')}`;
    const commaSeparated = mnemonic.split(' ').join(', ');
    const [redacted] = redactLogArgs([
      {
        first: capitalised,
        second: commaSeparated,
        third: `restored from ${mnemonic} successfully`,
      },
    ]);

    expect(redacted).toEqual({
      first: '[redacted]',
      second: '[redacted]',
      third: 'restored from [redacted] successfully',
    });
  });

  it('redacts WIF private keys', () => {
    const compressedWif = 'KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617';
    const uncompressedWif = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ';

    expect(redactLogArgs([`imported ${compressedWif}`, { value: uncompressedWif }])).toEqual([
      'imported [redacted]',
      { value: '[redacted]' },
    ]);
  });

  it('redacts unbracketed key origins and keychain ids', () => {
    const keyOrigin = `${fingerprint}/84'/0'/0'`;
    const [redacted] = redactLogArgs([
      {
        origin: keyOrigin,
        keyOrigins: [keyOrigin],
        keychainId: keyOrigin,
        keychainIds: [keyOrigin, keyOrigin],
      },
    ]);

    expect(serialize(redacted)).not.toContain(fingerprint);
    expect(redacted).toEqual({
      origin: "[redacted]/84'/0'/0'",
      keyOrigins: '[1 items]',
      keychainId: '[redacted]',
      keychainIds: '[2 items]',
    });
  });

  it('keeps keys that only contain a sensitive term readable', () => {
    const input = {
      description: 'Send bitcoin',
      subscription: 'active',
      transcript: 'done',
      hexColor: '#ff5500',
      ctx: 'popup',
      addressIndex: 3,
      addressType: 'p2wpkh',
      addressCount: 5,
      isAddressValid: true,
    };

    expect(redactLogArgs([input])).toEqual([input]);
  });

  it('does not redact ordinary prose or identifiers', () => {
    const prose =
      'The wallet could not reach the network because every request timed out while the user waited patiently for results';
    const words =
      'please check your internet connection then retry loading balances again before sending funds today';
    const identifier = 'networkConfigurationMismatchErr';

    expect(redactLogArgs([prose, words, identifier])).toEqual([prose, words, identifier]);
  });

  it('keeps and redacts the cause of an Error', () => {
    const error = new Error('Broadcast failed', {
      cause: new Error(`Rejected ${txid}`, { cause: { address: stacksAddress } }),
    });

    expect(redactLogArgs([error])[0]).toMatchObject({
      message: 'Broadcast failed',
      cause: { message: 'Rejected [redacted]', cause: { address: '[redacted]' } },
    });
  });

  it('never throws', () => {
    const throwingGetter = {
      get address() {
        throw new Error('boom');
      },
    };

    expect(redactLogArgs([throwingGetter, 'ok'])).toEqual(['[redacted]', 'ok']);
    expect(redactLogMessage(undefined)).toBe('[redacted]');
    expect(redactLogMessage({ address: stacksAddress, method: 'getAddresses' })).toBe(
      '{"address":"[redacted]","method":"getAddresses"}'
    );
  });
});
