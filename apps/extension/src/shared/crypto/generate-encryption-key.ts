import { WorkerScript, createWorker } from '../workers';

interface DeriveEncryptionKeyArgs {
  password: string;
  salt: string;
}
export async function deriveEncryptionKey(args: DeriveEncryptionKeyArgs): Promise<string> {
  const worker = createWorker(WorkerScript.DecryptionWorker);
  return new Promise((resolve, reject) => {
    function handleMessage(event: MessageEvent<string>) {
      worker.terminate();
      resolve(event.data);
    }
    function handleError(event: ErrorEvent) {
      worker.terminate();
      reject(new Error(event.message || 'Encryption worker failed'));
    }
    worker.addEventListener('message', handleMessage, { once: true });
    worker.addEventListener('error', handleError, { once: true });
    worker.postMessage(args);
  });
}
