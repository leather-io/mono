import { WorkerScript, createWorker } from '../workers';

const worker = createWorker(WorkerScript.DecryptionWorker);
interface DeriveEncryptionKeyArgs {
  password: string;
  salt: string;
}
export async function deriveEncryptionKey(args: DeriveEncryptionKeyArgs): Promise<string> {
  return new Promise(function (resolve) {
    function handler(e: MessageEvent<string>) {
      return resolve(e.data);
    }
    worker.addEventListener('message', handler);
    worker.postMessage(args);
  });
}
