import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Callout, CloudOffIcon, Text } from '@leather.io/ui/native';

import { EmptyLayout } from '../loading/empty-layout';

interface ErrorProps {
  errorMessage?: string;
}
export function Error({ errorMessage }: ErrorProps) {
  return (
    <EmptyLayout image={<Image source={require('@/assets/stickers/net.png')} />}>
      <Text variant="heading03">{t({ id: 'error.title', message: 'Something went wrong' })}</Text>
      <Text variant="label01">
        {t({ id: 'fetch-state-error.balance.subtitle', message: 'Pull to refresh' })}
      </Text>
      {errorMessage && <Text variant="code">{errorMessage}</Text>}
    </EmptyLayout>
  );
}

export function FetchErrorCallout() {
  return (
    <Callout
      title={t({
        id: 'fetch-state-error.balance.title',
        message: "Some balances couldn't load.",
      })}
      icon={
        <Box p="2">
          <CloudOffIcon />
        </Box>
      }
    >
      <Text variant="label02">
        {t({ id: 'fetch-state-error.balance.subtitle', message: 'Pull to refresh' })}
      </Text>
    </Callout>
  );
}
