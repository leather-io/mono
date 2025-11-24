import { ScrollView } from 'react-native-gesture-handler';

import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, HasChildren, Text } from '@leather.io/ui/native';

import { EmptyLayout, EmptyLayoutTab } from '../loading/empty-layout';

function WidgetWrap({ children }: HasChildren) {
  return (
    <Box py="3" px="0" alignItems="flex-start" flexShrink={0} alignSelf="stretch" mt="9">
      {children}
    </Box>
  );
}

export function ErrorFallbackTab() {
  return (
    <EmptyLayoutTab
      image={
        <Box>
          <Image
            style={{ height: 219, width: 270 }}
            contentFit="contain"
            source={require('@/assets/stickers/egg.png')}
          />
        </Box>
      }
    >
      <Text variant="heading03" textAlign="center" fontSize={32}>
        {t`Something went wrong`}
      </Text>
    </EmptyLayoutTab>
  );
}

interface ErrorProps {
  error?: Error;
  onRetry?(): void;
}
export function ErrorFallback({ error, onRetry }: ErrorProps) {
  return (
    <EmptyLayout
      image={
        <Box pt="8">
          <Image
            style={{ height: 219, width: 270 }}
            contentFit="contain"
            source={require('@/assets/stickers/egg.png')}
          />
        </Box>
      }
    >
      <Text variant="heading03" textAlign="center" fontSize={32}>
        {t`Something went wrong`}
      </Text>
      {onRetry ? (
        <Button onPress={onRetry}>{t`Try again`}</Button>
      ) : (
        <>
          <Text variant="label01" textAlign="center">
            {t`Drag to refresh`}
          </Text>

          {error && (
            <Box width={218} height="auto" alignItems="flex-start" bg="ink.background-secondary">
              <Text variant="code" textAlign="center">
                {error.message}
              </Text>
            </Box>
          )}
        </>
      )}
    </EmptyLayout>
  );
}

export function Error({ error, onRetry }: ErrorProps) {
  const bottomInset = useSafeBottomInset();

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: bottomInset }}
      refreshControl={<RefreshControl />}
    >
      <WidgetWrap>
        <ErrorFallback error={error} onRetry={onRetry} />
      </WidgetWrap>
    </ScrollView>
  );
}
