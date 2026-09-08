import { createWorker } from './index';

vi.mock('@shared/utils/analytics', () => ({ analytics: undefined }));

describe(createWorker.name, () => {
  test('creates a module worker', () => {
    const worker = { addEventListener: vi.fn() };
    const WorkerConstructor = vi.fn(function () {
      return worker;
    });
    vi.stubGlobal('Worker', WorkerConstructor);

    expect(createWorker('decryption-worker.js')).toBe(worker);
    expect(WorkerConstructor).toHaveBeenCalledWith('decryption-worker.js', { type: 'module' });
  });
});
