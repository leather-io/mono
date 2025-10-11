import { useState } from 'react';

import { Screen } from '@/components/screen/screen';
import { TextInput } from '@/components/text-input';
import { t } from '@lingui/core/macro';

import { validatePassword } from '@leather.io/google-backup';
import { Box, Button, Eye1ClosedIcon, Eye1Icon, Text } from '@leather.io/ui/native';

import { PasswordStrengthIndicator } from './password-strength-indicator';

type GooglePasswordMode = 'create' | 'recover';

interface GooglePasswordScreenProps {
  mode: GooglePasswordMode;
  password: string;
  onPasswordChange: (password: string) => void;
  onContinue: () => void;
  onForgotPassword?: () => void;
  isLoading?: boolean;
  error?: string;
}

export function GooglePasswordScreen({
  mode,
  password,
  onPasswordChange,
  onContinue,
  onForgotPassword,
  isLoading = false,
  error,
}: GooglePasswordScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  const config = {
    create: {
      title: t`Create Cloud Wallet Backup`,
      subtitle: t`This password protects your Google Drive backup. You'll need it when restoring your wallet.`,
      primaryButton: t`Create Wallet`,
    },
    recover: {
      title: t`Backup Found`,
      subtitle: t`Enter the password you created for backup. Not your Google account password.`,
      primaryButton: t`Restore Wallet`,
    },
  };
  const currentConfig = config[mode];

  const validation = validatePassword(password);
  const isDisabled =
    mode === 'create' ? !validation.meetsAllStrengthRequirements : password.length === 0;

  function handleContinue() {
    if (isDisabled) return;
    onContinue();
  }

  if (isLoading) {
    return (
      <Screen>
        <Screen.Body>
          <Box flex={1} justifyContent="center" alignItems="center">
            <Text variant="heading05">
              {mode === 'recover' ? t`Restoring your wallet...` : t`Creating your wallet...`}
            </Text>
            <Text variant="caption01" color="ink.text-subdued" mt="2">
              {mode === 'recover'
                ? t`Downloading from Google Drive`
                : t`Backing up to Google Drive`}
            </Text>
          </Box>
        </Screen.Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <Screen.Header />
      <Screen.Body>
        <Screen.Title>{currentConfig.title}</Screen.Title>
        <Box px="5" justifyContent="center" pb="11">
          <Box gap="8" alignItems="center" width="100%">
            <Box gap="3" alignItems="flex-start" width="100%">
              <Text variant="label01">{currentConfig.subtitle}</Text>
            </Box>

            <Box width="100%" gap="4">
              <Box position="relative">
                <TextInput
                  value={password}
                  onChangeText={onPasswordChange}
                  placeholder={t`Password`}
                  inputState={error ? 'error' : 'default'}
                  errorMessage={error}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textVariant="body01"
                />
                <Button
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    padding: 8,
                  }}
                  variant="ghost"
                >
                  {showPassword ? (
                    <Eye1ClosedIcon color="ink.text-subdued" />
                  ) : (
                    <Eye1Icon color="ink.text-subdued" />
                  )}
                </Button>
              </Box>

              {mode === 'create' && <PasswordStrengthIndicator password={password} />}
            </Box>
          </Box>
        </Box>
      </Screen.Body>

      <Screen.Footer paddingBottom="4" gap="4">
        {mode === 'recover' && onForgotPassword && (
          <Button onPress={onForgotPassword} variant="ghost" size="sm">
            <Text variant="caption01" color="ink.text-subdued">
              {t`I forgot my password`}
            </Text>
          </Button>
        )}
        <Button onPress={handleContinue} disabled={isDisabled}>
          {currentConfig.primaryButton}
        </Button>
      </Screen.Footer>
    </Screen>
  );
}
