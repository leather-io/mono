import type { ExtensionState } from '~/helpers/utils';

import { Button, type ButtonProps, type HasChildren } from '@leather.io/ui';
import { assertUnreachable } from '@leather.io/utils';

interface AuthButtonLayoutProps extends ButtonProps, HasChildren {}
export function AuthButtonLayout(props: AuthButtonLayoutProps) {
  return <Button variant="outline" fullWidth {...props}></Button>;
}

export function AuthButtonExtensionMissing(props: ButtonProps) {
  return <AuthButtonLayout {...props}>Install</AuthButtonLayout>;
}

export function AuthButtonExtensionInstalled(props: ButtonProps) {
  return <AuthButtonLayout {...props}>Connect</AuthButtonLayout>;
}

export function AuthButtonExtensionConnected(props: ButtonProps) {
  return <AuthButtonLayout {...props}>SP....sldkfjsd</AuthButtonLayout>;
}

interface AuthButtonProps extends ButtonProps {
  state: ExtensionState;
}
export function AuthButton({ state, ...rest }: AuthButtonProps) {
  switch (state) {
    case 'missing':
      return <AuthButtonExtensionMissing {...rest} />;
    case 'detected':
      return <AuthButtonExtensionInstalled {...rest} />;
    case 'connected':
      return <AuthButtonExtensionConnected {...rest} />;
    default:
      return assertUnreachable(state);
  }
}
