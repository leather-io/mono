import { base64urlnopad } from '@scure/base';

import {
  createPrfEnrollment,
  evaluatePrfCredential,
  rpName,
  userLabelPrefix,
} from './webauthn-prf';

function bytes(source: BufferSource) {
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
}

function createConfig(credentialId = new Uint8Array([1, 2, 3])) {
  return {
    credentialId: base64urlnopad.encode(credentialId),
    prfInput: base64urlnopad.encode(new Uint8Array(32).fill(4)),
    registrationTag: 'ABC234',
  };
}

function createSuccessfulCredential(credentialId = new Uint8Array([1, 2, 3])) {
  return {
    getClientExtensionResults: vi.fn().mockReturnValue({
      prf: { results: { first: new Uint8Array(32).fill(7) } },
    }),
    id: 'ignored',
    rawId: credentialId.buffer,
    toJSON: vi.fn(),
    type: 'public-key',
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(createPrfEnrollment.name, () => {
  test('uses fresh privacy-safe required-verification creation options', async () => {
    const create = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(createSuccessfulCredential(crypto.getRandomValues(new Uint8Array(16))))
      );
    vi.stubGlobal('navigator', { credentials: { create } });

    await createPrfEnrollment('omitted');
    await createPrfEnrollment('omitted');

    const first = create.mock.calls[0]?.[0]?.publicKey;
    const second = create.mock.calls[1]?.[0]?.publicKey;
    if (!first || !second) throw new Error('Expected two credential creation requests');
    expect(first.rp).toEqual({ name: rpName });
    expect(first.rp).not.toHaveProperty('id');
    expect(first.user.name).toMatch(new RegExp(`^${userLabelPrefix} · [A-HJ-NP-Z2-9]{6}$`));
    expect(first.user.displayName).toBe(first.user.name);
    expect(first.user.name).not.toBe(second.user.name);
    expect(first.user.id).toHaveLength(32);
    expect(first.authenticatorSelection).toEqual({
      authenticatorAttachment: 'platform',
      residentKey: 'discouraged',
      userVerification: 'required',
    });
    expect(first.attestation).toBe('none');
    expect(first).not.toHaveProperty('excludeCredentials');
    expect(bytes(first.challenge)).not.toEqual(bytes(second.challenge));
    expect(bytes(first.user.id)).not.toEqual(bytes(second.user.id));
    expect(bytes(first.extensions?.prf?.eval?.first ?? new Uint8Array())).not.toEqual(
      bytes(second.extensions?.prf?.eval?.first ?? new Uint8Array())
    );
  });

  test('pins exactly one credential and explicitly requires user verification', async () => {
    const config = createConfig();
    const get = vi.fn().mockResolvedValue(createSuccessfulCredential());
    vi.stubGlobal('navigator', { credentials: { get } });

    await evaluatePrfCredential(config, 'omitted');

    const request = get.mock.calls[0]?.[0]?.publicKey;
    expect(request?.userVerification).toBe('required');
    expect(request?.allowCredentials).toHaveLength(1);
    const credential = request?.allowCredentials?.[0];
    expect(credential?.type).toBe('public-key');
    expect(credential?.transports).toBeUndefined();
    expect(credential ? bytes(credential.id) : undefined).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('adds only the explicitly selected internal transport hint', async () => {
    const get = vi.fn().mockResolvedValue(createSuccessfulCredential());
    vi.stubGlobal('navigator', { credentials: { get } });

    await evaluatePrfCredential(createConfig(), 'internal');

    expect(get.mock.calls[0]?.[0]?.publicKey?.allowCredentials?.[0]?.transports).toEqual([
      'internal',
    ]);
  });

  test('rejects malformed local config before issuing a discovery request', async () => {
    const get = vi.fn();
    vi.stubGlobal('navigator', { credentials: { get } });

    const result = await evaluatePrfCredential(
      { credentialId: '*', prfInput: '*', registrationTag: 'ABC234' },
      'omitted'
    );

    expect(result).toEqual({ status: 'failure', code: 'invalid-config' });
    expect(get).not.toHaveBeenCalled();
  });
});

describe(evaluatePrfCredential.name, () => {
  test('rejects a returned credential mismatch before reading extension results', async () => {
    const getClientExtensionResults = vi.fn();
    const toJSON = vi.fn();
    const get = vi.fn().mockResolvedValue({
      getClientExtensionResults,
      id: 'different',
      rawId: new Uint8Array([9, 9, 9]).buffer,
      toJSON,
      type: 'public-key',
    });
    vi.stubGlobal('navigator', { credentials: { get } });

    const result = await evaluatePrfCredential(createConfig(), 'omitted');

    expect(result).toEqual({ status: 'failure', code: 'credential-mismatch' });
    expect(getClientExtensionResults).not.toHaveBeenCalled();
    expect(toJSON).not.toHaveBeenCalled();
  });

  test('returns only validated PRF bytes and never serializes the credential', async () => {
    const credentialId = new Uint8Array([1, 2, 3]);
    const prfOutput = new Uint8Array(32).fill(7);
    const getClientExtensionResults = vi.fn().mockReturnValue({
      prf: { results: { first: prfOutput } },
    });
    const toJSON = vi.fn();
    const get = vi.fn().mockResolvedValue({
      getClientExtensionResults,
      id: 'ignored',
      rawId: credentialId.buffer,
      toJSON,
      type: 'public-key',
    });
    vi.stubGlobal('navigator', { credentials: { get } });

    const result = await evaluatePrfCredential(createConfig(credentialId), 'omitted');

    expect(result.status).toBe('success');
    if (result.status === 'failure') return;
    expect(result.value.prfOutput).toEqual(prfOutput);
    expect(result.value.prfOutput).not.toBe(prfOutput);
    expect(toJSON).not.toHaveBeenCalled();
  });

  test('maps ambiguous NotAllowedError to a neutral non-specific result', async () => {
    const get = vi.fn().mockRejectedValue(new DOMException('not disclosed', 'NotAllowedError'));
    vi.stubGlobal('navigator', { credentials: { get } });

    const result = await evaluatePrfCredential(createConfig(), 'omitted');

    expect(result).toEqual({ status: 'failure', code: 'cancelled-or-timeout' });
  });
});

describe(createPrfEnrollment.name, () => {
  test('uses one pinned follow-up assertion when creation omits PRF output', async () => {
    const credentialId = new Uint8Array([5, 6, 7]);
    const prfOutput = new Uint8Array(32).fill(8);
    const createCredential = {
      getClientExtensionResults: vi.fn().mockReturnValue({ prf: { enabled: true } }),
      id: 'ignored',
      rawId: credentialId.buffer,
      toJSON: vi.fn(),
      type: 'public-key',
    };
    const getCredential = {
      getClientExtensionResults: vi.fn().mockReturnValue({
        prf: { results: { first: prfOutput } },
      }),
      id: 'ignored',
      rawId: credentialId.buffer,
      toJSON: vi.fn(),
      type: 'public-key',
    };
    const create = vi.fn().mockResolvedValue(createCredential);
    const get = vi.fn().mockResolvedValue(getCredential);
    vi.stubGlobal('navigator', { credentials: { create, get } });

    const result = await createPrfEnrollment('omitted');

    expect(result.status).toBe('success');
    if (result.status === 'failure') return;
    expect(result.value.followUpRequired).toBe(true);
    expect(result.value.config.registrationTag).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(get).toHaveBeenCalledTimes(1);
    const getOptions = get.mock.calls[0]?.[0];
    expect(getOptions?.publicKey?.allowCredentials).toHaveLength(1);
    expect(createCredential.toJSON).not.toHaveBeenCalled();
    expect(getCredential.toJSON).not.toHaveBeenCalled();
  });
});
