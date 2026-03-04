import { t } from '@lingui/core/macro';

import { TextInput, TextInputProps, Theme, useTheme } from '@leather.io/ui/native';

export function GenericSearchTextInput(props: TextInputProps<Theme>) {
  const theme = useTheme();
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
      placeholderTextColor={theme.colors['ink.text-subdued-secondary']}
      color="ink.text-primary"
      placeholder={t`Type URL or search`}
    />
  );
}
