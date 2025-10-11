export interface WalletEnvelope {
  version: 1;
  timestamp: string;
  walletId: string;

  // Encrypted data
  encryptedMnemonic: string;
  mnemonicNonce: string;
  encryptedPassphrase?: string;
  passphraseNonce?: string;
  protection: {
    kdf: {
      name: 'pbkdf2';
      salt: string;
      iterations: number;
    };
    wrappedMk: string;
    wrappedNonce: string;
  };
  // Unencrypted metadata
  metadata: {
    walletName: string;
    createdOn: string;
  };
}

export interface GoogleDriveBackupEntry {
  id?: string;
  name?: string | null;
  appProperties?: {
    walletName?: string | null;
  } | null;
  properties?: Record<string, string | null> | null;
}

export interface BackupResult {
  success: boolean;
  envelopeId?: string;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  mnemonic?: string;
  passphrase?: string;
  error?: string;
}
