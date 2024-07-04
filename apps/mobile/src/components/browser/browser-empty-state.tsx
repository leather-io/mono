import { TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Trans, t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { formatURL } from './utils';

interface BrowserEmptyStateProps {
  textURL: string;
  setTextURL: (val: string) => void;
  goToActiveBrowser: () => void;
}

export function BrowserEmptyState({
  textURL,
  setTextURL,
  goToActiveBrowser,
}: BrowserEmptyStateProps) {
  const { top } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  function redirect(url: string) {
    setTextURL(formatURL(url));
    goToActiveBrowser();
  }

  function submit() {
    redirect(textURL);
  }

  function resetTextInput() {
    setTextURL('');
  }

  return (
    <Box flex={1} backgroundColor="base.ink.background-primary" style={{ paddingTop: top }}>
      <Box px="4" py="2" flexDirection="row">
        <Box
          py="2"
          px="2"
          flexDirection="row"
          bg="base.ink.background-primary"
          borderRadius="sm"
          shadowColor="base.ink.background-overlay"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={5}
          borderColor="base.ink.border-transparent"
          borderWidth={1}
          flex={1}
        >
          <Box height={40} width={40} borderRadius="round" bg="base.yellow.border" />
          <TextInput
            keyboardType="web-search"
            textContentType="URL"
            autoCapitalize="none"
            onChangeText={setTextURL}
            value={textURL}
            autoComplete="url"
            onSubmitEditing={submit}
            style={{ paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }}
            placeholder={t`Type URL or search`}
          />
        </Box>
        {textURL ? (
          <TouchableOpacity p="3" mx="2" justifyContent="center" onPress={resetTextInput}>
            <Text variant="label02">
              <Trans>Cancel</Trans>
            </Text>
          </TouchableOpacity>
        ) : null}
      </Box>
    </Box>
  );
}
