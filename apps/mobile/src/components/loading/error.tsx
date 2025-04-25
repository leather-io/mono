import { t } from '@lingui/macro';

import { Box, Callout, CloudOffIcon, Text } from '@leather.io/ui/native';

import { EmptyLayout } from './empty-layout';

interface ErrorProps {
  errorMessage?: string;
}
export function Error({ errorMessage }: ErrorProps) {
  return (
    <EmptyLayout
      title={t({ id: 'fetch-state.error', message: 'Error' })}
      subtitle={errorMessage ?? ''}
    />
  );
}

export function FetchError() {
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
