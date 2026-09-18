import argon2, { ArgonType } from 'argon2-browser';

const context = self as unknown as Worker;

interface GenerateEncryptionKeyArgs {
  password: string;
  requestId: string;
  salt: string;
}

type GenerateEncryptionKeyResponse =
  | { requestId: string; status: 'failure' }
  | { encryptionKey: string; requestId: string; status: 'success' };

async function generateEncryptionKey({ password, salt }: GenerateEncryptionKeyArgs) {
  const x = performance.now();
  const argonHash = await argon2.hash({
    pass: password,
    salt,
    hashLen: 48,
    time: 44,
    mem: 1024 * 32,
    type: ArgonType.Argon2id,
  });
  const y = performance.now();
  // eslint-disable-next-line no-console
  console.log('Key stretch duration', (y - x) / 1000 + ' seconds');
  return argonHash.hashHex;
}

async function stretchKeyPostMessageHandler(e: MessageEvent<GenerateEncryptionKeyArgs>) {
  let response: GenerateEncryptionKeyResponse;
  try {
    const encryptionKey = await generateEncryptionKey(e.data);
    response = { encryptionKey, requestId: e.data.requestId, status: 'success' };
  } catch {
    response = { requestId: e.data.requestId, status: 'failure' };
  }
  context.postMessage(response);
}

context.addEventListener('message', stretchKeyPostMessageHandler);
