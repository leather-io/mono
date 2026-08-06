import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Form, Formik, type FormikErrors, type FormikHelpers } from 'formik';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Button, Callout, Sheet, SheetHeader } from '@leather.io/ui';

import { TARGET_BROWSER } from '@shared/environment';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import {
  blankPasswordValidation,
  validatePassword,
} from '@app/common/validation/validate-password';
import {
  canUsePlatformAuthenticator,
  getPlatformCredentialUserLabel,
} from '@app/common/wallet-authentication/platform-authenticator';
import { type WalletAuthenticationResult } from '@app/common/wallet-authentication/use-wallet-authentication';
import { ButtonRow, Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useToast } from '@app/features/toasts/use-toast';
import { PasswordField } from '@app/pages/onboarding/set-password/components/password-field';
import {
  selectPlatformUnlockConfig,
  selectWalletAuthenticationCapabilities,
} from '@app/store/software-keys/software-key.selectors';

type PageMode = 'overview' | 'password-enrollment' | 'password-replacement' | 'set-password';

interface PasswordFormValues {
  password: string;
}

interface PasswordFormProps {
  isNewPassword: boolean;
  submitLabel: string;
  onSubmit(password: string): Promise<WalletAuthenticationResult<void>>;
}

const initialPasswordFormValues: PasswordFormValues = { password: '' };

function PasswordForm({ isNewPassword, submitLabel, onSubmit }: PasswordFormProps) {
  const [strengthResult, setStrengthResult] = useState(blankPasswordValidation);

  function validate(values: PasswordFormValues): FormikErrors<PasswordFormValues> {
    if (!values.password) return { password: 'Enter your password' };
    if (!isNewPassword) return {};
    const result = validatePassword(values.password);
    setStrengthResult(result);
    return result.meetsAllStrengthRequirements ? {} : { password: 'Weak' };
  }

  async function submit(
    { password }: PasswordFormValues,
    { resetForm, setFieldError }: FormikHelpers<PasswordFormValues>
  ) {
    const result = await onSubmit(password);
    resetForm();
    setStrengthResult(blankPasswordValidation);
    if (result.status === 'failure' && result.code === 'invalid-password') {
      setFieldError('password', "The password you entered doesn't match");
    }
  }

  return (
    <Formik
      initialValues={initialPasswordFormValues}
      onSubmit={submit}
      validate={validate}
      validateOnBlur
      validateOnMount
      validateOnChange
    >
      {({ dirty, isSubmitting, isValid }) => (
        <Form>
          <Stack gap="space.04">
            <PasswordField
              dataTestId={SettingsSelectors.BiometricUnlockPasswordInput}
              strengthResult={strengthResult}
              isDisabled={isSubmitting}
              showStrength={isNewPassword}
            />
            <Button
              data-testid={SettingsSelectors.BiometricUnlockSubmit}
              disabled={!dirty || !isValid || isSubmitting}
              aria-busy={isSubmitting}
              type="submit"
            >
              {submitLabel}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

function failureMessage(result: WalletAuthenticationResult<unknown>) {
  if (result.status === 'success' || result.code === 'cancelled-or-timeout') return;
  if (result.code === 'prf-unavailable') {
    return "The option you chose can't be used for biometric unlock. Try again and choose a different option when Chrome asks where to save your passkey.";
  }
  return 'Biometric unlock could not be completed. Try again.';
}

export function BiometricUnlockPage() {
  const capabilities = useSelector(selectWalletAuthenticationCapabilities);
  const platformUnlock = useSelector(selectPlatformUnlockConfig);
  const keyActions = useKeyActions();
  const toast = useToast();
  const initiallyEnabled = capabilities.biometrics;
  const [mode, setMode] = useState<PageMode>(initiallyEnabled ? 'overview' : 'password-enrollment');
  const [failure, setFailure] = useState<string>();
  const [isBusy, setIsBusy] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  useEffect(() => {
    if (capabilities.biometrics && mode === 'password-enrollment') {
      setMode('overview');
    }
    if (!capabilities.biometrics && mode === 'overview') {
      setMode('password-enrollment');
    }
  }, [capabilities.biometrics, mode]);

  if (TARGET_BROWSER !== 'chromium' || !capabilities.valid || !canUsePlatformAuthenticator()) {
    return <Navigate to={RouteUrls.Settings} replace />;
  }

  async function saveWithPassword(password: string) {
    setFailure(undefined);
    analytics.track('biometric_unlock_enrollment_started', { source: 'settings' });
    const result = await keyActions.savePlatformUnlockWithPassword(password);
    if (result.status === 'success') {
      setMode('overview');
      if (capabilities.biometrics) {
        analytics.track('biometric_unlock_replaced');
      } else {
        analytics.track('biometric_unlock_enrollment_completed');
      }
      toast.success(
        capabilities.biometrics ? 'Biometric unlock updated' : 'Biometric unlock enabled'
      );
    } else {
      setFailure(failureMessage(result));
      if (result.code !== 'cancelled-or-timeout') {
        analytics.track('biometric_unlock_enrollment_failed', { category: result.code });
      }
    }
    return result;
  }

  async function replaceWithBiometrics() {
    setIsBusy(true);
    setFailure(undefined);
    try {
      const result = await keyActions.replacePlatformUnlockWithBiometrics();
      if (result.status === 'success') {
        analytics.track('biometric_unlock_replaced');
        toast.success('Biometric unlock updated');
      } else {
        setFailure(failureMessage(result));
        if (result.code !== 'cancelled-or-timeout') {
          analytics.track('biometric_unlock_enrollment_failed', { category: result.code });
        }
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function setPassword(password: string) {
    setFailure(undefined);
    const result = await keyActions.setBiometricOnlyPasswordTransition(password);
    if (result.status === 'success') {
      setMode('overview');
      toast.success('Password added');
    } else {
      setFailure(failureMessage(result));
    }
    return result;
  }

  async function disable() {
    setIsBusy(true);
    setFailure(undefined);
    try {
      await keyActions.disablePlatformUnlock();
      analytics.track('biometric_unlock_disabled');
      setShowDisable(false);
      setMode('password-enrollment');
      toast.success('Biometric unlock disabled');
    } catch {
      setShowDisable(false);
      setFailure('Biometric unlock could not be disabled. Try again.');
    } finally {
      setIsBusy(false);
    }
  }

  const isBiometricOnly = capabilities.authenticationMode === 'biometric-only';

  return (
    <Flex height="100vh" direction="column" data-testid={SettingsSelectors.BiometricUnlockPage}>
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>
      <Content>
        <Flex direction="column" height="100%" px="space.05" pb="space.05">
          <Flex alignItems="center" justifyContent="space-between" pb="space.05">
            <styled.h1 textStyle="heading.03">Biometric unlock</styled.h1>
            <styled.span textStyle="caption.01">
              {capabilities.biometrics ? 'On' : 'Off'}
            </styled.span>
          </Flex>

          <Stack gap="space.04">
            {failure && <Callout variant="warning">{failure}</Callout>}

            {mode === 'overview' && (
              <>
                <styled.p textStyle="body.02">
                  Unlock Leather, reveal your Secret Key, and add wallets using your device's
                  fingerprint, face, PIN, or password.
                </styled.p>
                <styled.p textStyle="caption.01">
                  {isBiometricOnly
                    ? "Biometric unlock protects your Secret Key on this device only. To access your wallet on another device, you'll need just your Secret Key."
                    : "Your Leather password remains a fallback in this profile. You'll need your Secret Key to restore your wallet on another device."}
                </styled.p>
                {platformUnlock && (
                  <styled.p textStyle="caption.01">
                    Passkey label: {getPlatformCredentialUserLabel(platformUnlock.registrationTag)}
                  </styled.p>
                )}
                <Button
                  data-testid={SettingsSelectors.BiometricUnlockReplace}
                  variant="outline"
                  disabled={isBusy}
                  aria-busy={isBusy}
                  onClick={() => {
                    if (isBiometricOnly) {
                      void replaceWithBiometrics();
                    } else {
                      setFailure(undefined);
                      setMode('password-replacement');
                    }
                  }}
                >
                  Set up again
                </Button>
                {isBiometricOnly ? (
                  <Button
                    data-testid={SettingsSelectors.BiometricUnlockSetPassword}
                    disabled={isBusy}
                    aria-busy={isBusy}
                    onClick={() => {
                      setFailure(undefined);
                      setMode('set-password');
                    }}
                  >
                    Set a password
                  </Button>
                ) : (
                  <Button
                    data-testid={SettingsSelectors.BiometricUnlockDisable}
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => setShowDisable(true)}
                  >
                    Disable
                  </Button>
                )}
              </>
            )}

            {(mode === 'password-enrollment' || mode === 'password-replacement') && (
              <>
                <styled.p textStyle="body.02">
                  Enter your Leather password, then confirm using your device.
                </styled.p>
                <styled.p textStyle="caption.01">
                  Leather uses your device's screen lock, which may accept a fingerprint, face, PIN,
                  or system password. Anyone who can unlock your user account can unlock Leather.
                </styled.p>
                <styled.p textStyle="caption.01">
                  Biometric unlock applies to every software wallet in this profile. It can unlock
                  Leather, reveal Secret Keys, and authorize adding wallets. Your Leather password
                  remains available as a fallback.
                </styled.p>
                <styled.p textStyle="caption.01">
                  Your passkey may sync through your provider, while Leather's encrypted wrapper and
                  wallet data remain local to this browser profile. You'll need your Secret Key to
                  restore elsewhere.
                </styled.p>
                <styled.p textStyle="caption.01">
                  Leather will prompt automatically when you open it while locked.
                </styled.p>
                <PasswordForm
                  isNewPassword={false}
                  submitLabel={mode === 'password-replacement' ? 'Set up again' : 'Enable'}
                  onSubmit={saveWithPassword}
                />
              </>
            )}

            {mode === 'set-password' && (
              <>
                <styled.p textStyle="body.02">
                  Add a Leather password as another way to unlock this wallet.
                </styled.p>
                <PasswordForm isNewPassword submitLabel="Set password" onSubmit={setPassword} />
              </>
            )}
          </Stack>
        </Flex>
      </Content>

      <Sheet
        isShowing={showDisable}
        onClose={() => setShowDisable(false)}
        header={<SheetHeader title="Disable biometric unlock?" />}
        footer={
          <ButtonRow flexDirection="row">
            <Button flexGrow={1} variant="outline" onClick={() => setShowDisable(false)}>
              Cancel
            </Button>
            <Button
              flexGrow={1}
              disabled={isBusy}
              aria-busy={isBusy}
              onClick={() => void disable()}
            >
              Disable
            </Button>
          </ButtonRow>
        }
      >
        <Flex p="space.05">
          <styled.p textStyle="body.02">
            You'll enter your wallet password the next time you unlock Leather. Your wallets and
            password aren't affected.
          </styled.p>
        </Flex>
      </Sheet>
    </Flex>
  );
}
