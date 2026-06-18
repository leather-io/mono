import { SetPasswordPage } from '../set-password/set-password';
import { EnterMnemonic } from './enter-mnemonic';
import { useSignIn } from './hooks/use-sign-in';

export function SignIn() {
  const { submitMnemonicForm, error, isLoading, mnemonicData, clearMnemonicData } = useSignIn();

  return mnemonicData ? (
    <SetPasswordPage mnemonicData={mnemonicData} onBack={clearMnemonicData} />
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
