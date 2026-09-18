import { deriveEncryptionKey } from './generate-encryption-key';

const mocks = vi.hoisted(() => {
  interface MockState {
    errorHandler?(): void;
    messageHandler?(event: MessageEvent<unknown>): void;
  }

  const state: MockState = {};
  const worker = {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      if (type === 'message') state.messageHandler = event => listener(event);
      if (type === 'error') state.errorHandler = () => listener(new Event('error'));
    }),
    postMessage: vi.fn(),
  };
  return { state, worker };
});

vi.mock('../workers', () => ({
  WorkerScript: { DecryptionWorker: 'decryption-worker.js' },
  createWorker: vi.fn(() => mocks.worker),
}));

interface DerivationRequest {
  password: string;
  requestId: string;
  salt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRequest(index: number): DerivationRequest {
  const request: unknown = mocks.worker.postMessage.mock.calls[index]?.[0];
  if (
    !isRecord(request) ||
    typeof request.password !== 'string' ||
    typeof request.requestId !== 'string' ||
    typeof request.salt !== 'string'
  ) {
    throw new Error('Expected derivation request');
  }
  return {
    password: request.password,
    requestId: request.requestId,
    salt: request.salt,
  };
}

function respond(data: unknown) {
  mocks.state.messageHandler?.(new MessageEvent('message', { data }));
}

describe(deriveEncryptionKey.name, () => {
  beforeEach(() => {
    mocks.worker.postMessage.mockClear();
  });

  test('correlates concurrent out-of-order worker responses', async () => {
    const firstResult = deriveEncryptionKey({ password: 'first', salt: 'one' });
    const secondResult = deriveEncryptionKey({ password: 'second', salt: 'two' });
    const firstRequest = getRequest(0);
    const secondRequest = getRequest(1);

    respond({ encryptionKey: 'second-key', requestId: secondRequest.requestId, status: 'success' });
    respond({ encryptionKey: 'first-key', requestId: firstRequest.requestId, status: 'success' });

    await expect(firstResult).resolves.toBe('first-key');
    await expect(secondResult).resolves.toBe('second-key');
  });

  test('settles only the failed request', async () => {
    const firstResult = deriveEncryptionKey({ password: 'first', salt: 'one' });
    const secondResult = deriveEncryptionKey({ password: 'second', salt: 'two' });
    const firstRequest = getRequest(0);
    const secondRequest = getRequest(1);

    respond({ requestId: firstRequest.requestId, status: 'failure' });
    respond({ encryptionKey: 'second-key', requestId: secondRequest.requestId, status: 'success' });

    await expect(firstResult).rejects.toThrow('Wallet encryption key derivation failed');
    await expect(secondResult).resolves.toBe('second-key');
  });
});
