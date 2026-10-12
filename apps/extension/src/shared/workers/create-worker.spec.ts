import { createWorker } from './create-worker';

const { untypedTrackMock } = vi.hoisted(() => ({ untypedTrackMock: vi.fn() }));

vi.mock('@shared/utils/analytics', () => ({ analytics: { untypedTrack: untypedTrackMock } }));

describe(createWorker.name, () => {
  test('creates a module worker', () => {
    const worker = { addEventListener: vi.fn() };
    const WorkerConstructor = vi.fn(() => worker);
    vi.stubGlobal('Worker', WorkerConstructor);

    expect(createWorker('decryption-worker.js')).toBe(worker);
    expect(WorkerConstructor).toHaveBeenCalledWith('decryption-worker.js', { type: 'module' });
  });

  test('tracks worker errors under a stable event name with the script url as a property', () => {
    const listeners: Record<string, (event: unknown) => void> = {};
    const worker = {
      addEventListener: vi.fn((type: string, listener: (event: unknown) => void) => {
        listeners[type] = listener;
      }),
    };
    vi.stubGlobal(
      'Worker',
      vi.fn(() => worker)
    );

    createWorker('/assets/decryption-worker-abc123.js');
    const error = new Error('boom');
    listeners.error(error);

    expect(untypedTrackMock).toHaveBeenCalledWith('worker_error_thrown', {
      scriptUrl: '/assets/decryption-worker-abc123.js',
      error,
    });
  });
});
