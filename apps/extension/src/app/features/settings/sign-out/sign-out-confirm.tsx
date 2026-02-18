import { RouteUrls } from '@shared/route-urls';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useNavigate } from '@app/routes/compat';

import { SignOutSheet } from './sign-out';

interface SignOutProps {
  onClose(): void;
}

export function SignOut({ onClose }: SignOutProps) {
  const { signOut } = useKeyActions();
  const navigate = useNavigate();

  return (
    <SignOutSheet
      isShowing
      onUserDeleteWallet={() => {
        void signOut().finally(() => {
          void navigate(RouteUrls.Onboarding);
        });
      }}
      onClose={onClose}
    />
  );
}
