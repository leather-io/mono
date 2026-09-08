import { WorkerScript, createWorker } from '../workers';
import type { DecryptionWorkerResponse } from '../workers/decryption-worker';

const defaultWorkerErrorMessage = 'Encryption worker failed';

interface DeriveEncryptionKeyArgs {
  password: string;
  salt: string;
}
export async function deriveEncryptionKey(args: DeriveEncryptionKeyArgs): Promise<string> {
  const worker = createWorker(WorkerScript.DecryptionWorker);
  return new Promise((resolve, reject) => {
    function handleMessage(event: MessageEvent<DecryptionWorkerResponse>) {
      worker.terminate();
      if ('error' in event.data) {
        reject(new Error(event.data.error || defaultWorkerErrorMessage));
        return;
      }
      resolve(event.data.hex);
    }
    function handleError(event: ErrorEvent) {
      worker.terminate();
      reject(new Error(event.message || defaultWorkerErrorMessage));
    }
    worker.addEventListener('message', handleMessage, { once: true });
    worker.addEventListener('error', handleError, { once: true });
    worker.postMessage(args);
  });
}
