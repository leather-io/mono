import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Stack } from 'leather-styles/jsx';
import { debounce } from 'ts-debounce';
import { z } from 'zod';

import { Button } from '@leather.io/ui';
import { isUndefined } from '@leather.io/utils';

import { requiredStringField } from '@shared/forms/field-schemas';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useLatestCallback } from '@app/common/hooks/use-latest-callback';
import { createFormResolver } from '@app/common/validation/form-resolver';
import {
  blankPasswordValidation,
  validatePassword,
} from '@app/common/validation/validate-password';
import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column.layout';
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
}
export function SetPasswordPage({ mnemonicData, onBack }: SetPasswordPageProps) {
  const [loading, setLoading] = useState(false);
  const [strengthResult, setStrengthResult] = useState(blankPasswordValidation);
  const { setPassword } = useKeyActions();
  const softwareKeys = useSelector(selectSoftwareKeys);
  const hasSoftwareKeys = !!softwareKeys.length;
  const checkPassword = useCheckPassword();

  const navigate = useNavigate();

  const submit = useCallback(
    async (password: string) => {
      await setPassword({
        password,
        mnemonic: mnemonicData.mnemonic,
        fingerprint: mnemonicData.fingerprint,
      });
      void navigate(RouteUrls.Home, { replace: true, state: { fromOnboarding: true } });
    },
    [setPassword, navigate, mnemonicData.fingerprint, mnemonicData.mnemonic]
  );

  const resolver = createFormResolver<SetPasswordFormValues>(
    z.object({
      password: hasSoftwareKeys
        ? requiredStringField('Enter your password')
        : requiredStringField('password is a required field').check(
            z.refine<string>(
              debounce<
                [value: unknown, ...rest: unknown[]],
                (value: unknown, ...rest: unknown[]) => boolean
              >((value: unknown) => {
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
              }, 60),
              { error: 'Weak' }
            )
          ),
    })
  );

  const form = useForm<SetPasswordFormValues>({
    defaultValues: setPasswordFormValues,
    resolver,
    mode: 'all',
  });
  const { setError } = form;
  const { isDirty, isSubmitting, isValid } = form.formState;

  const onSubmit = useCallback(
    async ({ password }: SetPasswordFormValues) => {
      if (!password) return;
      setLoading(true);
      try {
        if (hasSoftwareKeys) {
          if (await checkPassword({ password })) {
            await submit(password);
            return;
          }
          setError('password', { message: "The password you entered doesn't match" });
          return;
        }

        if (strengthResult.meetsAllStrengthRequirements) {
          analytics.track('submit_valid_password');
          await submit(password);
        }
      } catch {
        setError('password', { message: 'Something went wrong setting your password' });
      } finally {
        setLoading(false);
      }
    },
    [hasSoftwareKeys, checkPassword, setError, strengthResult, submit]
  );

  const submitForm = useLatestCallback(onSubmit);
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
        <FormProvider {...form}>
          <form onSubmit={event => void form.handleSubmit(submitForm)(event)}>
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
                    disabled={loading || !(isDirty && isValid)}
                    aria-busy={loading || isSubmitting}
                    mt="space.05"
                    type="submit"
                  >
                    Continue
                  </Button>
                </Stack>
              }
            />
          </form>
        </FormProvider>
      </Content>
    </>
  );
}
