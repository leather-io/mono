export function getSignOutCalloutTitle(softwareWalletCount: number): string {
  return softwareWalletCount > 1
    ? "You'll need your Secret Keys to sign in again"
    : "You'll need your Secret Key to sign in again";
}

export function getSignOutCalloutBody(softwareWalletCount: number): string {
  if (softwareWalletCount === 0)
    return "When you sign out, you'll need to reconnect your Ledger to sign back into your wallet.";
  if (softwareWalletCount === 1)
    return "Back up your Secret Key before signing out. You'll be asked for your Secret Key on your next login.";
  return "Back up the Secret Key for each wallet below before signing out. You'll be asked for a Secret Key on your next login.";
}

export function getBackupConfirmationLabel(
  walletName: string,
  softwareWalletCount: number
): string {
  return softwareWalletCount > 1
    ? `I have backed up the Secret Key for ${walletName}.`
    : 'I have backed up my Secret Key.';
}

export function getPasswordDisableLabel(softwareWalletCount: number): string {
  return softwareWalletCount > 1
    ? 'I understand that my password will not give me access to my wallets after I sign out.'
    : 'I understand that my password will not give me access to my wallet after I sign out.';
}

export function getBiometricDisableLabel(softwareWalletCount: number): string {
  return softwareWalletCount > 1
    ? 'I understand that biometric unlock will not give me access to my wallets after I sign out.'
    : 'I understand that biometric unlock will not give me access to my wallet after I sign out.';
}
