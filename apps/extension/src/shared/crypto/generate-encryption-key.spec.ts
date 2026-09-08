import { createWorker } from '../workers';
import { deriveEncryptionKey } from './generate-encryption-key';

vi.mock('../workers', () => ({
  WorkerScript: { DecryptionWorker: 'decryption-worker.js' },
  createWorker: vi.fn(),
}));

type Listener = (event: { data?: unknown; message?: string }) => void;

function createFakeWorker() {
  const listeners = new Map<string, Listener>();
  return {
    addEventListener: vi.fn((type: string, listener: Listener) => {
      listeners.set(type, listener);
    }),
    postMessage: vi.fn(),
    terminate: vi.fn(),
    emit(type: string, event: { data?: unknown; message?: string }) {
      listeners.get(type)?.(event);
    },
  };
}

describe(deriveEncryptionKey.name, () => {
  const args = { password: 'pw', salt: 'salt' };

  test('resolves with the hex from a successful worker response and terminates', async () => {
    const worker = createFakeWorker();
    vi.mocked(createWorker).mockReturnValue(worker as unknown as Worker);

    const promise = deriveEncryptionKey(args);
    expect(worker.postMessage).toHaveBeenCalledWith(args);
    worker.emit('message', { data: { hex: 'abc123' } });

    await expect(promise).resolves.toBe('abc123');
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test('rejects and terminates when the worker reports an internal failure', async () => {
    const worker = createFakeWorker();
    vi.mocked(createWorker).mockReturnValue(worker as unknown as Worker);

    const promise = deriveEncryptionKey(args);
    worker.emit('message', { data: { error: 'wasm failed' } });

    await expect(promise).rejects.toThrow('wasm failed');
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  test('rejects and terminates on a worker error event', async () => {
    const worker = createFakeWorker();
    vi.mocked(createWorker).mockReturnValue(worker as unknown as Worker);

    const promise = deriveEncryptionKey(args);
    worker.emit('error', { message: 'script failed to load' });

    await expect(promise).rejects.toThrow('script failed to load');
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });
});
