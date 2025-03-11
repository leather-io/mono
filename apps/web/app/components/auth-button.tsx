import type { AuthState } from '~/helpers/utils';

import { Button, type ButtonProps } from '@leather.io/ui';

const authStateCopyMap: Record<AuthState, string> = {
  'no-extension': 'Install',
  'extension-pre-onboarding': 'Sign up',
  'extension-user': 'Account',
};

interface AuthButtonProps extends ButtonProps {
  state: AuthState;
}
export function AuthButton(props: AuthButtonProps) {
  return (
    <Button variant="outline" {...props}>
      {authStateCopyMap[props.state]}
    </Button>
  );
}
