import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Form, Formik } from 'formik';
import { Stack } from 'leather-styles/jsx';
import { debounce } from 'ts-debounce';
import * as yup from 'yup';

import { Button } from '@leather.io/ui';
import { isUndefined } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useFinishAuthRequest } from '@app/common/authentication/use-finish-auth-request';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
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
} from '@app/components/layout/layouts/two-column-current.layout';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { PasswordField } from './components/password-field';

interface SetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
const setPasswordFormValues: SetPasswordFormValues = { password: '', confirmPassword: '' };

export function SetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [strengthResult, setStrengthResult] = useState(blankPasswordValidation);
  const stacksAccounts = useStacksAccounts();
  const { setPassword } = useKeyActions();
  const finishSignIn = useFinishAuthRequest();
  const navigate = useNavigate();
  const { decodedAuthRequest } = useOnboardingState();

  useEffect(() => {
    analytics.page('view', '/set-password');
  }, []);

  const submit = useCallback(
    async (password: string) => {
      await setPassword(password);

      if (decodedAuthRequest) {
        if (!stacksAccounts) return;

        if (stacksAccounts && stacksAccounts.length > 1) {
          void navigate(RouteUrls.ChooseAccount);
        } else {
          await finishSignIn(0);
        }
      } else {
        void navigate(RouteUrls.Home, { replace: true, state: { fromOnboarding: true } });
      }
    },
    [setPassword, decodedAuthRequest, stacksAccounts, navigate, finishSignIn]
  );

  const onSubmit = useCallback(
    async ({ password }: SetPasswordFormValues) => {
      if (!password) return;
      setLoading(true);
      if (strengthResult.meetsAllStrengthRequirements) {
        analytics.track('submit_valid_password');
        await submit(password);
        return;
      }
      setLoading(false);
    },
    [strengthResult, submit]
  );

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
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
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
                    title="Set a password"
                    description="Your password protects your Secret Key on this device only. To access your wallet on another device, you'll need just your Secret Key."
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
                    minWidth={{
                      base: '100%',
                      md: '400px',
                      lg: 'twoColumnPageWidth',
                    }}
                    flex="1"
                  >
                    <PasswordField strengthResult={strengthResult} isDisabled={loading} />
                    <Button
                      data-testid={OnboardingSelectors.SetPasswordBtn}
                      disabled={loading || !(dirty && isValid)}
                      aria-busy={loading || isSubmitting}
                      mt="space.05"
                      type="submit"
                    >
                      Continue
                    </Button>
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
