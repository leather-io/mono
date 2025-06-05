import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Button, HasChildren, Text } from '@leather.io/ui/native';

import { EmptyLayout } from '../loading/empty-layout';
import { PageLayout } from '../page/page.layout';

function WidgetWrap({ children }: HasChildren) {
  return (
    <Box py="3" px="0" alignItems="flex-start" flexShrink={0} alignSelf="stretch" mt="9">
      {children}
    </Box>
  );
}

interface ErrorProps {
  error?: Error;
  onRetry?: () => void;
}

export function Error({ error, onRetry }: ErrorProps) {
  return (
    <PageLayout>
      <WidgetWrap>
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
            {t({ id: 'error_boundary.title', message: 'Something went wrong' })}
          </Text>
          {onRetry ? (
            <Button
              onPress={onRetry}
              title={t({ id: 'error_boundary.action', message: 'Try again' })}
            />
          ) : (
            <>
              <Text variant="label01" textAlign="center">
                {t({ id: 'error_boundary.subtitle', message: 'Drag to refresh' })}
              </Text>

              {error && (
                <Box
                  width={218}
                  height="auto"
                  alignItems="flex-start"
                  bg="ink.background-secondary"
                >
                  <Text variant="code" textAlign="center">
                    {error.message}
                  </Text>
                </Box>
              )}
            </>
          )}
        </EmptyLayout>
      </WidgetWrap>
    </PageLayout>
  );
}
