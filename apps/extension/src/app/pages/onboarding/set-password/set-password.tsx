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
import type { WalletAuthenticationResult } from '@app/common/wallet-authentication/use-wallet-authentication';
import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column.layout';
import { RequestWalletAuthentication } from '@app/components/request-wallet-authentication';
import { useCheckPassword } from '@app/store/software-keys/software-key.hooks';
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
  const checkPassword = useCheckPassword();

  const navigate = useNavigate();

  const submit = useCallback(
    async (password: string) => {
      await keyActions.setPassword({
        password,
        mnemonic: mnemonicData.mnemonic,
        fingerprint: mnemonicData.fingerprint,
      });
      void navigate(RouteUrls.Home, { replace: true, state: { fromOnboarding: true } });
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
          await submit(password);
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
      try {
        if (!(await checkPassword({ password }))) {
          return { status: 'failure', code: 'invalid-password' };
        }
        await submit(password);
        return { status: 'success', value: undefined };
      } catch {
        return { status: 'failure', code: 'invalid-password' };
      }
    },
    [checkPassword, submit]
  );

  const onExistingWalletBiometricSubmit = useCallback(async (): Promise<
    WalletAuthenticationResult<void>
  > => {
    try {
      const result = await keyActions.addWalletWithBiometrics({
        fingerprint: mnemonicData.fingerprint,
        mnemonic: mnemonicData.mnemonic,
      });
      if (result.status === 'failure') return result;
      void navigate(RouteUrls.Home, { replace: true, state: { fromOnboarding: true } });
      return { status: 'success', value: undefined };
    } catch {
      return { status: 'failure', code: 'wallet-validation-failed' };
    }
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
            caption="Confirm it's you to add this wallet. It joins your existing wallets and uses the same unlock settings."
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
    password: hasSoftwareKeys
      ? yup.string().required('Enter your password')
      : yup
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
  const title = hasSoftwareKeys ? 'Enter your Password' : 'Set a password';
  const description = hasSoftwareKeys
    ? 'Enter the password you set on this device.'
    : "Your password protects your Secret Key on this device only. To access your wallet on another device, you'll need just your Secret Key.";

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
                leftColumn={<DescriptionColumn title={title} description={description} />}
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
                      showStrength={!hasSoftwareKeys}
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
                    {TARGET_BROWSER === 'chromium' && (
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
