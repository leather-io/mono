import { useState } from 'react';

import { GooglePasswordScreen } from '@/features/wallet-manager/import-google-wallet/google-password-screen';
import { useGoogleWallet } from '@/hooks/use-google-wallet';
import { t } from '@lingui/core/macro';

export default function ImportGoogleNew() {
  const { createGoogleWallet, isLoading } = useGoogleWallet();
  const [error, setError] = useState<string | undefined>();

  const [password, setPassword] = useState('');

  async function handleCreateWallet() {
    try {
      setError(undefined);
      await createGoogleWallet(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Wallet creation failed. Please try again.`);
    }
  }
  return (
    <GooglePasswordScreen
      mode="create"
      password={password}
      error={error}
      onPasswordChange={setPassword}
      onContinue={handleCreateWallet}
      isLoading={isLoading}
    />
  );
}
