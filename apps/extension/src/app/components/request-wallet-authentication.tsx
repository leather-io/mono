import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Box, Stack, styled } from 'leather-styles/jsx';

import { Button, Input, Logo } from '@leather.io/ui';

import { TARGET_BROWSER } from '@shared/environment';
import { analytics } from '@shared/utils/analytics';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { buildEnterKeyEvent } from '@app/common/hooks/use-modifier-key';
import { WaitingMessages, useWaitingMessage } from '@app/common/hooks/use-waiting-message';
import { consumeActionPopupPromptIntent } from '@app/common/wallet-authentication/action-popup-classifier';
import {
  isBiometricAutoPromptSuppressed,
  shouldSuppressBiometricAutoPrompt,
  suppressBiometricAutoPrompt,
} from '@app/common/wallet-authentication/biometric-auto-prompt';
import { canUsePlatformAuthenticator } from '@app/common/wallet-authentication/platform-authenticator';
import type {
  WalletAuthenticationFailureCode,
  WalletAuthenticationResult,
} from '@app/common/wallet-authentication/wallet-authentication';
import { Card, Page } from '@app/components/layout';
import { selectWalletAuthenticationCapabilities } from '@app/store/software-keys/software-key.selectors';

import { ErrorLabel } from './error-label';

const waitingMessages: WaitingMessages = {
  '2': 'Verifying…',
  '10': 'Still working…',
  '20': 'Almost there',
};

interface RequestWalletAuthenticationProps {
  automaticPromptOnActionPopup?: boolean;
  caption: string;
  onBiometricSubmit?(): Promise<WalletAuthenticationResult<void>>;
  onConsumeStartIntent?(): void;
  onPasswordSubmit?(password: string): Promise<WalletAuthenticationResult<void>>;
  onRecovery?(): void;
  onSuccess(): void;
  recoveryLabel?: string;
  startWithBiometrics?: boolean;
  title: string;
}

function getPasswordFailureMessage(code: WalletAuthenticationFailureCode) {
  if (code === 'invalid-password') return 'The password you entered is invalid';
  if (code === 'wallet-already-exists') return 'This wallet has already been added';
  if (code === 'state-changed') return 'Wallet data changed. Try again.';
  if (code === 'persistence-failed') return "Leather couldn't save the wallet. Try again.";
  if (code === 'invalid-config') return "This wallet's unlock method is unavailable.";
  return 'Wallet authentication could not be completed. Try again.';
}

export function RequestWalletAuthentication({
  automaticPromptOnActionPopup = false,
  caption,
  onBiometricSubmit,
  onConsumeStartIntent,
  onPasswordSubmit,
  onRecovery,
  onSuccess,
  recoveryLabel,
  startWithBiometrics = false,
  title,
}: RequestWalletAuthenticationProps) {
  const capabilities = useSelector(selectWalletAuthenticationCapabilities);
  const canAuthenticateWithPassword =
    capabilities.valid && capabilities.password && !capabilities.biometrics;
  const canAuthenticateWithBiometrics =
    capabilities.valid &&
    capabilities.biometrics &&
    !capabilities.password &&
    TARGET_BROWSER === 'chromium' &&
    canUsePlatformAuthenticator();
  const keyActions = useKeyActions();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [platformMessage, setPlatformMessage] = useState('');
  const [hasAttemptedBiometrics, setHasAttemptedBiometrics] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);
  const running = useRef(false);
  const startedFromIntent = useRef(false);

  const [isRunning, waitingMessage, startWaitingMessage, stopWaitingMessage] =
    useWaitingMessage(waitingMessages);

  const authenticateWithPassword = onPasswordSubmit ?? keyActions.authenticateWalletWithPassword;

  const authenticateWithBiometrics = useCallback(async (): Promise<
    WalletAuthenticationResult<void>
  > => {
    if (onBiometricSubmit) return onBiometricSubmit();
    const result = await keyActions.unlockWalletWithBiometrics();
    if (result.status === 'failure') return result;
    return { status: 'success', value: undefined };
  }, [keyActions, onBiometricSubmit]);

  const submitBiometrics = useCallback(
    async (automatic: boolean) => {
      if (running.current) return;
      running.current = true;
      setPasswordError('');
      setPlatformMessage('');
      startWaitingMessage();
      analytics.track('biometric_unlock_attempt_started');
      try {
        const result = await authenticateWithBiometrics();
        if (result.status === 'success') {
          analytics.track('biometric_unlock_attempt_completed');
          onSuccess();
          return;
        }
        setHasAttemptedBiometrics(true);
        if (result.code === 'cancelled-or-timeout') {
          analytics.track('biometric_unlock_attempt_canceled');
        } else {
          setPlatformMessage('Biometric unlock could not be completed. Try again.');
          analytics.track('biometric_unlock_attempt_failed', { category: result.code });
          if (automatic && shouldSuppressBiometricAutoPrompt(result.code)) {
            await suppressBiometricAutoPrompt();
          }
        }
        passwordInput.current?.focus();
      } catch {
        setHasAttemptedBiometrics(true);
        setPlatformMessage('Biometric unlock could not be completed. Try again.');
        analytics.track('biometric_unlock_attempt_failed', { category: 'unavailable' });
        if (automatic && shouldSuppressBiometricAutoPrompt('unavailable')) {
          await suppressBiometricAutoPrompt();
        }
        passwordInput.current?.focus();
      } finally {
        running.current = false;
        stopWaitingMessage();
      }
    },
    [authenticateWithBiometrics, onSuccess, startWaitingMessage, stopWaitingMessage]
  );

  useEffect(() => {
    if (startedFromIntent.current || !canAuthenticateWithBiometrics) return;
    if (startWithBiometrics) {
      startedFromIntent.current = true;
      onConsumeStartIntent?.();
      void submitBiometrics(false);
      return;
    }
    if (!automaticPromptOnActionPopup || !consumeActionPopupPromptIntent()) return;
    startedFromIntent.current = true;
    void isBiometricAutoPromptSuppressed().then(suppressed => {
      if (!suppressed) void submitBiometrics(true);
    });
  }, [
    automaticPromptOnActionPopup,
    canAuthenticateWithBiometrics,
    onConsumeStartIntent,
    startWithBiometrics,
    submitBiometrics,
  ]);

  const submitPassword = useCallback(async () => {
    if (running.current || !password) return;
    running.current = true;
    const startUnlockTimeMs = performance.now();
    analytics.track('start_unlock');
    startWaitingMessage();
    setPasswordError('');
    setPlatformMessage('');
    try {
      const result = await authenticateWithPassword(password);
      setPassword('');
      if (result.status === 'success') {
        onSuccess();
      } else {
        setPasswordError(getPasswordFailureMessage(result.code));
      }
    } finally {
      running.current = false;
      stopWaitingMessage();
      analytics.track('complete_unlock', { durationMs: performance.now() - startUnlockTimeMs });
    }
  }, [authenticateWithPassword, onSuccess, password, startWaitingMessage, stopWaitingMessage]);

  const biometricButtonLabel = hasAttemptedBiometrics
    ? 'Try biometric unlock again'
    : 'Unlock with biometrics';
  const shouldAutoFocusPassword = canAuthenticateWithPassword;

  return (
    <Page>
      <Card
        contentStyle={{ p: 'space.00' }}
        header={
          <styled.h1 p="space.04" hideBelow="sm">
            <Box px="space.02">
              <Logo />
            </Box>
          </styled.h1>
        }
        footer={
          <Stack gap="space.03" width="100%">
            {canAuthenticateWithPassword && (
              <Button
                data-testid={SettingsSelectors.UnlockWalletBtn}
                disabled={isRunning || !password}
                aria-busy={isRunning}
                onClick={() => void submitPassword()}
                variant="solid"
                fullWidth
              >
                Continue
              </Button>
            )}
            {canAuthenticateWithBiometrics && (
              <Button
                disabled={isRunning}
                aria-busy={isRunning}
                onClick={() => void submitBiometrics(false)}
                variant="solid"
                fullWidth
              >
                {biometricButtonLabel}
              </Button>
            )}
            {onRecovery && recoveryLabel && (
              <Button disabled={isRunning} onClick={onRecovery} variant="ghost" fullWidth>
                {recoveryLabel}
              </Button>
            )}
          </Stack>
        }
      >
        <Stack gap="space.05" px="space.05" minHeight="330px">
          <styled.h3 textStyle="heading.03">{title}</styled.h3>
          <styled.p textStyle="label.02">{(isRunning && waitingMessage) || caption}</styled.p>
          {platformMessage && <styled.p textStyle="label.02">{platformMessage}</styled.p>}
          {canAuthenticateWithPassword && (
            <Input.Root>
              <Input.Label>Enter your password</Input.Label>
              <Input.Field
                ref={passwordInput}
                autoFocus={shouldAutoFocusPassword}
                autoCapitalize="off"
                autoComplete="off"
                type="password"
                data-testid={SettingsSelectors.EnterPasswordInput}
                value={password}
                onChange={event => {
                  setPasswordError('');
                  setPassword(event.currentTarget.value);
                }}
                onKeyUp={buildEnterKeyEvent(submitPassword)}
              />
            </Input.Root>
          )}
          {passwordError && <ErrorLabel width="100%">{passwordError}</ErrorLabel>}
        </Stack>
      </Card>
    </Page>
  );
}
