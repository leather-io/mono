import {
  BackupResult,
  GoogleDriveBackupEntry,
  RestoreResult,
  WalletEnvelope,
} from '@leather.io/models';

import { decryptEnvelope, encryptEnvelope } from '../../../google-drive/src/encryption-utils';
import { GoogleDriveClient } from '../infrastructure/api/google/google-backup-api.client';

export class GoogleBackupService {
  private readonly drive: GoogleDriveClient;

  constructor(accessToken: string) {
    this.drive = new GoogleDriveClient(accessToken);
  }

  private getFileName(walletId: string): string {
    return `${walletId}.json`;
  }

  async createBackup({
    mnemonic,
    passphrase,
    password,
    walletId,
    walletName,
  }: {
    mnemonic: string;
    passphrase?: string;
    password: string;
    walletId: string;
    walletName: string;
  }): Promise<BackupResult> {
    try {
      // eslint-disable-next-line no-console
      console.log('creating backup');
      const {
        encryptedMnemonic,
        mnemonicNonce,
        salt,
        iterations,
        wrappedMk,
        wrapNonce,
        passphraseNonce,
        encryptedPassphrase,
      } = await encryptEnvelope(mnemonic, password, passphrase);
      // eslint-disable-next-line no-console
      console.log(
        'encrypted',
        encryptedMnemonic,
        mnemonicNonce,
        salt,
        iterations,
        wrappedMk,
        wrapNonce,
        passphraseNonce,
        encryptedPassphrase
      );
      const envelope: WalletEnvelope = {
        version: 1,
        timestamp: new Date().toISOString(),
        walletId,
        encryptedMnemonic,
        mnemonicNonce,
        protection: {
          kdf: {
            name: 'pbkdf2',
            salt,
            iterations,
          },
          wrappedMk: wrappedMk,
          wrappedNonce: wrapNonce,
        },
        encryptedPassphrase,
        passphraseNonce,
        metadata: {
          walletName,
          createdOn: new Date().toISOString(),
        },
      };

      const fileName = this.getFileName(walletId);
      await this.drive.upload(fileName, envelope, { walletName });

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Backup creation failed: ${message}` };
    }
  }

  async restoreBackup({
    walletId,
    password,
  }: {
    walletId: string;
    password: string;
  }): Promise<RestoreResult> {
    try {
      const fileName = this.getFileName(walletId);
      const data = await this.drive.download<WalletEnvelope>(fileName);

      const { mnemonic, passphrase } = await decryptEnvelope(data, password);
      return {
        success: true,
        mnemonic,
        passphrase,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Restore failed: ${message}` };
    }
  }

  /** Delete a wallet backup by wallet ID. */
  async deleteBackup(walletId: string): Promise<BackupResult> {
    try {
      const fileName = this.getFileName(walletId);
      await this.drive.delete(fileName);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Delete failed: ${message}` };
    }
  }

  /** List all available backups in Drive. */
  async listBackups(): Promise<GoogleDriveBackupEntry[]> {
    try {
      return await this.drive.list();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to list backups: ${message}`);
    }
  }

  /** Update account count in an existing backup (metadata-only update). */
  async updateAccountCount({
    walletId,
    accountCount,
  }: {
    walletId: string;
    accountCount: number;
  }): Promise<BackupResult> {
    try {
      const fileName = this.getFileName(walletId);
      const file = await this.drive.findFileByName(fileName);
      if (!file) {
        return { success: false, error: `Backup not found: ${fileName}` };
      }

      const updatedMetadata = {
        metadata: {
          accountCount,
          lastUpdated: new Date().toISOString(),
        },
      };

      await this.drive.updateMetadata(file.id as string, updatedMetadata);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Update failed: ${message}` };
    }
  }

  /** Check if a backup already exists for a wallet ID. */
  async hasBackup(walletId: string): Promise<boolean> {
    try {
      const fileName = this.getFileName(walletId);
      const files = await this.drive.list();
      return files.some((f: any) => f.name === fileName);
    } catch {
      return false; // Conservative: treat error as "no backup found"
    }
  }
}

/** Factory helper */
export function createGoogleDriveWallet(accessToken: string): GoogleBackupService {
  return new GoogleBackupService(accessToken);
}
