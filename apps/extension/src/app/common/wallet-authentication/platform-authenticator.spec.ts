import { base64urlnopad } from '@scure/base';

function bytes(source: BufferSource) {
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
}

function createCredentialConfig(credentialId = new Uint8Array([1, 2, 3])) {
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

describe('platform authenticator', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock('@shared/environment');
    vi.stubGlobal('PublicKeyCredential', class {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('uses fresh private required-verification creation options', async () => {
    const create = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(createSuccessfulCredential(crypto.getRandomValues(new Uint8Array(16))))
      );
    vi.stubGlobal('navigator', { credentials: { create } });
    const { createPlatformCredential } = await import('./platform-authenticator');

    const firstResult = await createPlatformCredential();
    const secondResult = await createPlatformCredential();

    expect(firstResult.status).toBe('success');
    expect(secondResult.status).toBe('success');
    if (firstResult.status === 'failure' || secondResult.status === 'failure') return;
    const first = create.mock.calls[0]?.[0]?.publicKey;
    const second = create.mock.calls[1]?.[0]?.publicKey;
    if (!first || !second) throw new Error('Expected two credential creation requests');
    expect(first.rp).toEqual({ name: 'Leather' });
    expect(first.rp).not.toHaveProperty('id');
    expect(first.user.name).toMatch(/^Leather biometric unlock · [A-HJ-NP-Z2-9]{6}$/);
    expect(first.user.displayName).toBe(first.user.name);
    expect(first.user.id).toHaveLength(32);
    expect(first.authenticatorSelection).toEqual({
      authenticatorAttachment: 'platform',
      residentKey: 'discouraged',
      userVerification: 'required',
    });
    expect(first).not.toHaveProperty('excludeCredentials');
    expect(bytes(first.challenge)).not.toEqual(bytes(second.challenge));
    expect(bytes(first.user.id)).not.toEqual(bytes(second.user.id));
    expect(firstResult.value.credential.prfInput).not.toBe(secondResult.value.credential.prfInput);
    expect(firstResult.value.credential).not.toHaveProperty('challenge');
    expect(firstResult.value.credential).not.toHaveProperty('userId');
  });

  test('pins exactly one internal credential and requires user verification', async () => {
    const get = vi.fn().mockResolvedValue(createSuccessfulCredential());
    vi.stubGlobal('navigator', { credentials: { get } });
    const { evaluatePlatformCredential } = await import('./platform-authenticator');

    await evaluatePlatformCredential(createCredentialConfig());

    const request = get.mock.calls[0]?.[0]?.publicKey;
    expect(request?.userVerification).toBe('required');
    expect(request?.allowCredentials).toHaveLength(1);
    expect(request?.allowCredentials?.[0]?.transports).toEqual(['internal']);
    expect(request?.allowCredentials?.[0]?.type).toBe('public-key');
    expect(bytes(request?.allowCredentials?.[0]?.id)).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('rejects invalid config before issuing a discovery request', async () => {
    const get = vi.fn();
    vi.stubGlobal('navigator', { credentials: { get } });
    const { evaluatePlatformCredential } = await import('./platform-authenticator');

    const result = await evaluatePlatformCredential({
      credentialId: '*',
      prfInput: '*',
      registrationTag: 'ABC234',
    });

    expect(result).toEqual({ status: 'failure', code: 'invalid-config' });
    expect(get).not.toHaveBeenCalled();
  });

  test('rejects a credential mismatch before reading PRF output', async () => {
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
    const { evaluatePlatformCredential } = await import('./platform-authenticator');

    const result = await evaluatePlatformCredential(createCredentialConfig());

    expect(result).toEqual({ status: 'failure', code: 'credential-mismatch' });
    expect(getClientExtensionResults).not.toHaveBeenCalled();
    expect(toJSON).not.toHaveBeenCalled();
  });

  test('keeps credential objects contained and returns copied PRF bytes', async () => {
    const credential = createSuccessfulCredential();
    const get = vi.fn().mockResolvedValue(credential);
    vi.stubGlobal('navigator', { credentials: { get } });
    const { evaluatePlatformCredential } = await import('./platform-authenticator');

    const result = await evaluatePlatformCredential(createCredentialConfig());

    expect(result.status).toBe('success');
    if (result.status === 'failure') return;
    expect(result.value.prfOutput).toEqual(new Uint8Array(32).fill(7));
    expect(credential.toJSON).not.toHaveBeenCalled();
  });

  test('uses one pinned follow-up assertion when creation omits PRF output', async () => {
    const credentialId = new Uint8Array([5, 6, 7]);
    const createCredential = {
      getClientExtensionResults: vi.fn().mockReturnValue({ prf: { enabled: true } }),
      id: 'ignored',
      rawId: credentialId.buffer,
      toJSON: vi.fn(),
      type: 'public-key',
    };
    const getCredential = createSuccessfulCredential(credentialId);
    const create = vi.fn().mockResolvedValue(createCredential);
    const get = vi.fn().mockResolvedValue(getCredential);
    vi.stubGlobal('navigator', { credentials: { create, get } });
    const { createPlatformCredential } = await import('./platform-authenticator');

    const result = await createPlatformCredential();

    expect(result.status).toBe('success');
    if (result.status === 'failure') return;
    expect(result.value.followUpRequired).toBe(true);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0]?.[0]?.publicKey?.allowCredentials).toHaveLength(1);
    expect(get.mock.calls[0]?.[0]?.publicKey?.allowCredentials?.[0]?.transports).toEqual([
      'internal',
    ]);
    expect(createCredential.toJSON).not.toHaveBeenCalled();
    expect(getCredential.toJSON).not.toHaveBeenCalled();
  });

  test('maps ambiguous cancellation without suppressing future retries', async () => {
    const get = vi.fn().mockRejectedValue(new DOMException('not disclosed', 'NotAllowedError'));
    vi.stubGlobal('navigator', { credentials: { get } });
    const { evaluatePlatformCredential } = await import('./platform-authenticator');

    await expect(evaluatePlatformCredential(createCredentialConfig())).resolves.toEqual({
      status: 'failure',
      code: 'cancelled-or-timeout',
    });
  });

  test('does not treat a null credential response as successful enrollment', async () => {
    const create = vi.fn().mockResolvedValue(null);
    vi.stubGlobal('navigator', { credentials: { create } });
    const { createPlatformCredential } = await import('./platform-authenticator');

    await expect(createPlatformCredential()).resolves.toEqual({
      status: 'failure',
      code: 'unavailable',
    });
  });

  test('fails closed for the Firefox build even with mocked WebAuthn globals', async () => {
    const create = vi.fn().mockResolvedValue(createSuccessfulCredential());
    vi.stubGlobal('navigator', { credentials: { create } });
    vi.doMock('@shared/environment', async importOriginal => ({
      ...(await importOriginal()),
      TARGET_BROWSER: 'firefox',
    }));
    const { createPlatformCredential } = await import('./platform-authenticator');

    await expect(createPlatformCredential()).resolves.toEqual({
      status: 'failure',
      code: 'unsupported-browser',
    });
    expect(create).not.toHaveBeenCalled();
  });
});
