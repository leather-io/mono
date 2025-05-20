import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { TextInput, TextInputProps, Theme } from '@leather.io/ui/native';

export function GenericSearchTextInput(props: TextInputProps<Theme>) {
  const theme = useTheme<Theme>();
  return (
    <TextInput
      {...props}
      keyboardType="web-search"
      textContentType="URL"
      autoCapitalize="none"
      autoComplete="url"
      width="100%"
      py="5"
      borderRadius="sm"
      placeholderTextColor={theme.colors['ink.text-subdued']}
      color="ink.text-primary"
      placeholder={t({
        id: 'browser.input_placeholder',
        message: 'Type URL or search',
      })}
    />
  );
}
