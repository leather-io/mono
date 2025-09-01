import { t } from '@lingui/core/macro';

import { Box, Callout, CloudOffIcon, Text } from '@leather.io/ui/native';

export function FetchErrorCallout() {
  return (
    <Callout
      title={t`Some balances couldn’t load.`}
      icon={
        <Box p="2">
          <CloudOffIcon />
        </Box>
      }
    >
      <Text variant="label02">{t`Pull to refresh`}</Text>
    </Callout>
  );
}
