import { GoogleDriveBackupEntry } from '@leather.io/models';

export function extractBackupWalletId(entry?: GoogleDriveBackupEntry | null): string | null {
  const name = entry?.name;
  if (!name) return null;
  return name.replace(/\.json$/, '');
}

export function selectBackupByWalletName(
  entries: GoogleDriveBackupEntry[],
  walletName: string
): GoogleDriveBackupEntry | undefined {
  return entries.find(entry => entry.appProperties?.walletName === walletName);
}
