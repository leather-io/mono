import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Form, Formik, type FormikHelpers } from 'formik';
import { Stack } from 'leather-styles/jsx';
import { debounce } from 'ts-debounce';
import * as yup from 'yup';

import { BasicTooltip, Button, Callout } from '@leather.io/ui';
import { isUndefined } from '@leather.io/utils';

import { TARGET_BROWSER } from '@shared/environment';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import {
  blankPasswordValidation,
  validatePassword,
} from '@app/common/validation/validate-password';
import { canUsePlatformAuthenticator } from '@app/common/wallet-authentication/platform-authenticator';
import type { WalletAuthenticationResult } from '@app/common/wallet-authentication/wallet-authentication';
import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column.layout';
import { RequestWalletAuthentication } from '@app/components/request-wallet-authentication';
import { selectSoftwareKeys } from '@app/store/software-keys/software-key.selectors';

import { PasswordField } from './components/password-field';

interface SetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
const setPasswordFormValues: SetPasswordFormValues = { password: '', confirmPassword: '' };

interface SetPasswordPageProps {
  mnemonicData: { mnemonic: string; fingerprint: string };
  onBack?(): void;
  startWithBiometrics?: boolean;
}
export function SetPasswordPage({
  mnemonicData,
  onBack,
  startWithBiometrics = false,
}: SetPasswordPageProps) {
  const [loading, setLoading] = useState(false);
  const [strengthResult, setStrengthResult] = useState(blankPasswordValidation);
  const [biometricFailure, setBiometricFailure] = useState<string>();
  const keyActions = useKeyActions();
  const softwareKeys = useSelector(selectSoftwareKeys);
  const hasSoftwareKeys = !!softwareKeys.length;
  const supportsBiometricSetup = TARGET_BROWSER === 'chromium';
  const unlockMethodTitle = supportsBiometricSetup
    ? 'Choose how to unlock Leather'
    : 'Set a password';
  const unlockMethodDescription = supportsBiometricSetup
    ? 'Choose a password or biometrics. Your choice applies to every software wallet in this browser profile.'
    : 'Your password applies to every software wallet in this browser profile.';

  const navigate = useNavigate();

  const submit = useCallback(
    async (password: string): Promise<WalletAuthenticationResult<void>> => {
      const result = await keyActions.setPassword({
        password,
        mnemonic: mnemonicData.mnemonic,
        fingerprint: mnemonicData.fingerprint,
      });
      if (result.status === 'success') {
        void navigate(RouteUrls.Home, { replace: true, state: { fromOnboarding: true } });
      }
      return result;
    },
    [keyActions, navigate, mnemonicData.fingerprint, mnemonicData.mnemonic]
  );

  const onSubmit = useCallback(
    async (
      { password }: SetPasswordFormValues,
      { setFieldError }: FormikHelpers<SetPasswordFormValues>
    ) => {
      if (!password) return;
      setLoading(true);
      try {
        if (strengthResult.meetsAllStrengthRequirements) {
          analytics.track('submit_valid_password');
          const result = await submit(password);
          if (result.status === 'failure') {
            setFieldError('password', 'Something went wrong setting your password');
          }
        }
      } catch {
        setFieldError('password', 'Something went wrong setting your password');
      } finally {
        setLoading(false);
      }
    },
    [strengthResult, submit]
  );

  const onExistingWalletPasswordSubmit = useCallback(
    async (password: string): Promise<WalletAuthenticationResult<void>> => {
      return submit(password);
    },
    [submit]
  );

  const onExistingWalletBiometricSubmit = useCallback(async (): Promise<
    WalletAuthenticationResult<void>
  > => {
    const result = await keyActions.addWalletWithBiometrics({
      fingerprint: mnemonicData.fingerprint,
      mnemonic: mnemonicData.mnemonic,
    });
    if (result.status === 'failure') return result;
    void navigate(RouteUrls.Home, { replace: true, state: { fromOnboarding: true } });
    return { status: 'success', value: undefined };
  }, [keyActions, mnemonicData.fingerprint, mnemonicData.mnemonic, navigate]);

  const createBiometricWallet = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setBiometricFailure(undefined);
    analytics.track('biometric_unlock_enrollment_started', { source: 'first_software_wallet' });
    try {
      const result = await keyActions.createBiometricSoftwareWallet(mnemonicData);
      if (result.status === 'success') {
        analytics.track('biometric_unlock_enrollment_completed');
        void navigate(RouteUrls.Home, { replace: true, state: { fromOnboarding: true } });
        return;
      }
      if (result.code !== 'cancelled-or-timeout') {
        setBiometricFailure(
          result.code === 'prf-unavailable'
            ? "The option you chose can't be used for biometric unlock. Try again and choose a different option when Chrome asks where to save your passkey."
            : 'Biometric unlock could not be set up. Try again or continue with a password.'
        );
        analytics.track('biometric_unlock_enrollment_failed', { category: result.code });
      }
    } finally {
      setLoading(false);
    }
  }, [keyActions, loading, mnemonicData, navigate]);

  if (hasSoftwareKeys) {
    return (
      <>
        <Header px="space.04">
          <HeaderGrid leftCol={<HeaderBackButton onBack={onBack} />} rightCol={null} />
        </Header>
        <Content>
          <RequestWalletAuthentication
            title="Confirm it's you"
            caption="Confirm it's you to add this wallet. It joins your existing wallets and uses the same unlock method."
            startWithBiometrics={startWithBiometrics}
            onPasswordSubmit={onExistingWalletPasswordSubmit}
            onBiometricSubmit={onExistingWalletBiometricSubmit}
            onSuccess={() => undefined}
          />
        </Content>
      </>
    );
  }

  const validationSchema = yup.object({
    password: yup
      .string()
      .required()
      .test({
        message: 'Weak',
        test: debounce((value: unknown) => {
          if (isUndefined(value)) {
            setStrengthResult(blankPasswordValidation);
            return false;
          }
          if (typeof value !== 'string') return false;
          const result = validatePassword(value);
          setStrengthResult(result);
          if (!result.meetsAllStrengthRequirements) {
            analytics.track('submit_invalid_password');
          }
          return result.meetsAllStrengthRequirements;
        }, 60) as unknown as yup.TestFunction<any, any>,
      }),
  });

  return (
    <>
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton onBack={onBack} />} rightCol={null} />
      </Header>
      <Content>
        <Formik
          initialValues={setPasswordFormValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnBlur
          validateOnMount
          validateOnChange
        >
          {({ dirty, isSubmitting, isValid }) => (
            <Form>
              <TwoColumnLayout
                leftColumn={
                  <DescriptionColumn
                    title={unlockMethodTitle}
                    description={unlockMethodDescription}
                  />
                }
                rightColumn={
                  <Stack
                    p="space.05"
                    gap="space.04"
                    bg="ink.background-primary"
                    border="default"
                    borderRadius="lg"
                    width="100%"
                    minWidth={['100%', null, '400px', 'twoColumnPageWidth']}
                    flex="1"
                  >
                    <PasswordField
                      strengthResult={strengthResult}
                      isDisabled={loading}
                      showStrength
                    />
                    <Button
                      data-testid={OnboardingSelectors.SetPasswordBtn}
                      disabled={loading || !(dirty && isValid)}
                      aria-busy={loading || isSubmitting}
                      mt="space.05"
                      type="submit"
                    >
                      Continue
                    </Button>
                    {supportsBiometricSetup && (
                      <>
                        <BasicTooltip
                          asChild
                          label={
                            canUsePlatformAuthenticator()
                              ? undefined
                              : "Biometric unlock isn't available in this browser context."
                          }
                          side="top"
                        >
                          <Button
                            data-testid={OnboardingSelectors.BiometricSetupBtn}
                            aria-disabled={!canUsePlatformAuthenticator()}
                            disabled={loading}
                            aria-busy={loading}
                            variant="outline"
                            onClick={() => {
                              if (canUsePlatformAuthenticator()) void createBiometricWallet();
                            }}
                          >
                            Use biometrics
                          </Button>
                        </BasicTooltip>
                        <Callout variant="info">
                          Biometrics will be your only local unlock method. If biometrics become
                          unavailable, you'll need your Secret Key to restore your wallet.
                        </Callout>
                      </>
                    )}
                    {biometricFailure && <Callout variant="warning">{biometricFailure}</Callout>}
                  </Stack>
                }
              />
            </Form>
          )}
        </Formik>
      </Content>
    </>
  );
}
