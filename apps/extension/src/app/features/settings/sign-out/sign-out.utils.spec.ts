import {
  getBackupConfirmationLabel,
  getBiometricDisableLabel,
  getPasswordDisableLabel,
  getSignOutCalloutBody,
  getSignOutCalloutTitle,
} from './sign-out.utils';

describe('sign-out copy helpers', () => {
  describe(getSignOutCalloutTitle.name, () => {
    test('uses singular wording for Ledger-only and a single software wallet', () => {
      expect(getSignOutCalloutTitle(0)).toBe("You'll need your Secret Key to sign in again");
      expect(getSignOutCalloutTitle(1)).toBe("You'll need your Secret Key to sign in again");
    });

    test('uses plural wording for multiple software wallets', () => {
      expect(getSignOutCalloutTitle(2)).toBe("You'll need your Secret Keys to sign in again");
      expect(getSignOutCalloutTitle(5)).toBe("You'll need your Secret Keys to sign in again");
    });
  });

  describe(getSignOutCalloutBody.name, () => {
    test('explains reconnecting a Ledger when there are no software wallets', () => {
      expect(getSignOutCalloutBody(0)).toBe(
        "When you sign out, you'll need to reconnect your Ledger to sign back into your wallet."
      );
    });

    test('uses singular backup wording for a single software wallet', () => {
      expect(getSignOutCalloutBody(1)).toBe(
        "Back up your Secret Key before signing out. You'll be asked for your Secret Key on your next login."
      );
    });

    test('asks to back up each wallet when there are multiple software wallets', () => {
      expect(getSignOutCalloutBody(3)).toBe(
        "Back up the Secret Key for each wallet below before signing out. You'll be asked for a Secret Key on your next login."
      );
    });
  });

  describe(getBackupConfirmationLabel.name, () => {
    test('uses generic singular wording for a single software wallet', () => {
      expect(getBackupConfirmationLabel('Wallet 1', 1)).toBe('I have backed up my Secret Key.');
    });

    test('names the specific wallet when there are multiple software wallets', () => {
      expect(getBackupConfirmationLabel('Wallet 1', 2)).toBe(
        'I have backed up the Secret Key for Wallet 1.'
      );
      expect(getBackupConfirmationLabel('Savings', 3)).toBe(
        'I have backed up the Secret Key for Savings.'
      );
    });
  });

  describe(getPasswordDisableLabel.name, () => {
    test('uses singular "wallet" for one or fewer software wallets', () => {
      expect(getPasswordDisableLabel(0)).toBe(
        'I understand that my password will not give me access to my wallet after I sign out.'
      );
      expect(getPasswordDisableLabel(1)).toBe(
        'I understand that my password will not give me access to my wallet after I sign out.'
      );
    });

    test('uses plural "wallets" for multiple software wallets', () => {
      expect(getPasswordDisableLabel(2)).toBe(
        'I understand that my password will not give me access to my wallets after I sign out.'
      );
    });
  });

  describe(getBiometricDisableLabel.name, () => {
    test('uses biometric wording without claiming that a Leather password exists', () => {
      expect(getBiometricDisableLabel(1)).toBe(
        'I understand that biometric unlock will not give me access to my wallet after I sign out.'
      );
      expect(getBiometricDisableLabel(2)).toBe(
        'I understand that biometric unlock will not give me access to my wallets after I sign out.'
      );
    });
  });
});
