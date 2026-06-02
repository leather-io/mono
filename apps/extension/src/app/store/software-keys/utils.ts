import { deriveEncryptionKey } from '@shared/crypto/generate-encryption-key';

export async function checkPassword({
  password,
  encryptionKey,
  salt,
}: {
  password: string;
  encryptionKey: string;
  salt: string;
}) {
  const testEncryptionKey = await deriveEncryptionKey({ password, salt });
  return testEncryptionKey === encryptionKey;
}
