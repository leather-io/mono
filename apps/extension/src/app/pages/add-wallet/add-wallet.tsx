import { SetPasswordPage } from '../onboarding/set-password/set-password';
import { EnterMnemonic } from '../onboarding/sign-in/enter-mnemonic';
import { useSignIn } from '../onboarding/sign-in/hooks/use-sign-in';

export function AddWallet() {
  const { submitMnemonicForm, error, isLoading, mnemonicData, clearMnemonicData } = useSignIn();

  return mnemonicData ? (
    <SetPasswordPage mnemonicData={mnemonicData} onBack={clearMnemonicData} startWithBiometrics />
  ) : (
    <EnterMnemonic
      onSubmit={submitMnemonicForm}
      error={error}
      isLoading={isLoading}
      title="Sign in with your Secret Key"
      description="Speed things up by pasting your entire Secret Key in one go."
    />
  );
}
