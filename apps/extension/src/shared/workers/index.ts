import { analytics } from '@shared/utils/analytics';

import decryptionWorkerUrl from './decryption-worker?worker&url';

export const WorkerScript = {
  DecryptionWorker: decryptionWorkerUrl,
};

export function createWorker(scriptName: string) {
  const worker = new Worker(scriptName);
  worker.addEventListener('error', error => {
    analytics?.untypedTrack(`worker_error_thrown_${scriptName}`, { error });
  });

  return worker;
}
