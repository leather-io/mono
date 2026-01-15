import { EnterMnemonic } from './enter-mnemonic';

export function SignIn() {
  return (
    <EnterMnemonic
      title="Sign in with your Secret Key"
      description="Speed things up by pasting your entire Secret Key in one go."
    />
  );
}
