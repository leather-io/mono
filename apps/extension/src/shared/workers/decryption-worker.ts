import argon2, { ArgonType } from 'argon2-browser/dist/argon2-bundled.min.js';

interface GenerateEncryptionKeyArgs {
  password: string;
  salt: string;
}

export type DecryptionWorkerResponse = { hex: string } | { error: string };

interface DecryptionWorkerContext {
  postMessage: (message: DecryptionWorkerResponse) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<GenerateEncryptionKeyArgs>) => void
  ) => void;
}

const context: DecryptionWorkerContext = self;

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

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function stretchKeyPostMessageHandler(e: MessageEvent<GenerateEncryptionKeyArgs>) {
  try {
    const hex = await generateEncryptionKey(e.data);
    const response: DecryptionWorkerResponse = { hex };
    context.postMessage(response);
  } catch (error) {
    const response: DecryptionWorkerResponse = { error: toErrorMessage(error) };
    context.postMessage(response);
  }
}

context.addEventListener('message', event => void stretchKeyPostMessageHandler(event));
