import { useMemo } from 'react';

import { t } from '@lingui/core/macro';

import { validatePassword } from '@leather.io/google-backup';
import { Box, Text } from '@leather.io/ui/native';

export function calculatePasswordStrength(password: string): {
  level: number;
  label: string;
  color: 'red.action-primary-default' | 'yellow.border' | 'green.action-primary-default' | '';
} {
  if (password.length === 0) return { level: 0, label: '', color: '' };

  const validation = validatePassword(password);

  switch (validation.score) {
    case 0:
    case 1:
      return { level: 1, label: t`Poor`, color: 'red.action-primary-default' };
    case 2:
      return { level: 2, label: t`Weak`, color: 'red.action-primary-default' };
    case 3:
      return { level: 3, label: t`Good`, color: 'yellow.border' };
    case 4:
      return {
        level: validation.meetsAllStrengthRequirements ? 4 : 3,
        label: validation.meetsAllStrengthRequirements ? t`Strong` : t`Good`,
        color: validation.meetsAllStrengthRequirements
          ? 'green.action-primary-default'
          : 'yellow.border',
      };
    default:
      return { level: 0, label: '', color: '' };
  }
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const validation = useMemo(() => validatePassword(password), [password]);

  const bars = [1, 2, 3, 4];
  const filledBars = strength.level;

  return (
    <Box gap="1">
      <Box flexDirection="row" gap="2" marginTop="2">
        {bars.map(bar => (
          <Box
            key={bar}
            flex={1}
            height={8}
            borderRadius="lg"
            backgroundColor={
              bar <= filledBars && strength.color ? strength.color : 'ink.border-default'
            }
          />
        ))}
      </Box>
      <Text variant="caption01" color="ink.text-subdued" marginTop="2">
        {t`Password strength:`} {strength.label || '—'}
      </Text>
      {password.length > 0 && !validation.meetsLengthRequirement && (
        <Text variant="caption01" color="red.action-primary-default" marginTop="1">
          {t`Password must be at least 12 characters`}
        </Text>
      )}
      {validation.feedback.warning && (
        <Text variant="caption01" color="yellow.border" marginTop="1">
          {validation.feedback.warning}
        </Text>
      )}
    </Box>
  );
}
