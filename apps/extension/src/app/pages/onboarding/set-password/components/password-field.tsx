import { useMemo, useState } from 'react';
import { useController } from 'react-hook-form';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { Caption, Eye1ClosedIcon, Eye1Icon, Input } from '@leather.io/ui';

import { useThemeSwitcher } from '@app/common/theme-provider';
import { type ValidatedPassword } from '@app/common/validation/validate-password';
import { ErrorLabel } from '@app/components/error-label';

import { getIndicatorsOfPasswordStrength } from './password-field.utils';
import { PasswordStrengthIndicator } from './password-strength-indicator';

interface PasswordFieldProps {
  strengthResult: ValidatedPassword;
  isDisabled: boolean;
  showStrength?: boolean;
}
export function PasswordField({
  strengthResult,
  isDisabled,
  showStrength = true,
}: PasswordFieldProps) {
  const { field, fieldState, formState } = useController<{ password: string }>({
    name: 'password',
  });
  const { error: fieldError, isTouched } = fieldState;
  const { submitCount } = formState;
  const error = fieldError?.message;
  const showError = isTouched || submitCount > 0;
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useThemeSwitcher();

  const { strengthColorLightMode, strengthColorDarkMode, strengthText } = useMemo(
    () => getIndicatorsOfPasswordStrength(strengthResult),
    [strengthResult]
  );

  return (
    <>
      <Box position="relative">
        <Input.Root hasError={!showStrength && showError && !!error}>
          <Input.Label>Password</Input.Label>
          <Input.Field
            autoCapitalize="off"
            autoComplete="off"
            autoFocus
            data-testid={OnboardingSelectors.NewPasswordInput}
            disabled={isDisabled}
            key="password-input"
            type={showPassword ? 'text' : 'password'}
            width="100%"
            name={field.name}
            ref={field.ref}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        </Input.Root>
        <styled.button
          _focus={{ bg: 'transparent', outline: 'none' }}
          _hover={{ bg: 'transparent', outline: 'none' }}
          bg="transparent"
          appearance="none"
          height="20px"
          onClick={() => setShowPassword(!showPassword)}
          position="absolute"
          right="space.04"
          top="22px"
          type="button"
          width="20px"
          zIndex={10}
        >
          {showPassword ? <Eye1ClosedIcon /> : <Eye1Icon />}
        </styled.button>
      </Box>
      {showStrength ? (
        <>
          <PasswordStrengthIndicator
            password={field.value}
            strengthColor={theme === 'light' ? strengthColorLightMode : strengthColorDarkMode}
            strengthResult={strengthResult}
          />
          <Flex alignItems="center">
            <Caption mr="space.02">Password strength:</Caption>
            <Caption>{field.value ? strengthText : '—'}</Caption>
          </Flex>
        </>
      ) : (
        showError && error && <ErrorLabel>{error}</ErrorLabel>
      )}
    </>
  );
}
