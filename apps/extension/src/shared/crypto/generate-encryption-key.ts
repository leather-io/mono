import { WorkerScript, createWorker } from '../workers';
import { generateRandomHexString } from './generate-random-hex';

const worker = createWorker(WorkerScript.DecryptionWorker);

interface DeriveEncryptionKeyArgs {
  password: string;
  salt: string;
}

interface DeriveEncryptionKeyRequest extends DeriveEncryptionKeyArgs {
  requestId: string;
}

type DeriveEncryptionKeyResponse =
  | { requestId: string; status: 'failure' }
  | { encryptionKey: string; requestId: string; status: 'success' };

interface PendingDerivation {
  reject(error: Error): void;
  resolve(encryptionKey: string): void;
}

const pendingDerivations = new Map<string, PendingDerivation>();

function handleDerivationResponse(event: MessageEvent<DeriveEncryptionKeyResponse>) {
  const pending = pendingDerivations.get(event.data.requestId);
  if (!pending) return;
  pendingDerivations.delete(event.data.requestId);
  if (event.data.status === 'failure') {
    pending.reject(new Error('Wallet encryption key derivation failed'));
    return;
  }
  pending.resolve(event.data.encryptionKey);
}

function handleWorkerError() {
  const pending = [...pendingDerivations.values()];
  pendingDerivations.clear();
  for (const derivation of pending) {
    derivation.reject(new Error('Wallet encryption worker failed'));
  }
}

worker.addEventListener('message', handleDerivationResponse);
worker.addEventListener('error', handleWorkerError);

export async function deriveEncryptionKey(args: DeriveEncryptionKeyArgs): Promise<string> {
  const requestId = generateRandomHexString();
  return new Promise((resolve, reject) => {
    pendingDerivations.set(requestId, { reject, resolve });
    const request: DeriveEncryptionKeyRequest = { ...args, requestId };
    worker.postMessage(request);
  });
}
