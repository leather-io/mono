import { t } from '@lingui/macro';

import { Box, HasChildren, Text } from '@leather.io/ui/native';

import { PageLayout } from './page/page.layout';

function WidgetWrap({ children }: HasChildren) {
  return (
    <Box py="3" px="0" alignItems="flex-start" flexShrink={0} alignSelf="stretch" mt="9">
      {children}
    </Box>
  );
}

interface ErrorProps {
  error: Error;
  image?: React.ReactNode;
}

export function Error({ error, image }: ErrorProps) {
  return (
    <PageLayout actionBar={false}>
      <WidgetWrap>
        <Box justifyContent="center" alignItems="center" mt="9">
          <Box gap="4" alignItems="center" padding="5">
            {image ? (
              image
            ) : (
              <Box
                width={218}
                height={200}
                alignItems="flex-start"
                bg="ink.background-secondary"
              ></Box>
            )}
            <Text variant="heading03" textAlign="center" fontSize={32}>
              {t({ id: 'error_boundary.title', message: 'Something went wrong' })}
            </Text>
            <Text variant="label01" textAlign="center">
              {t({ id: 'error_boundary.subtitle', message: 'Pull this page to refresh' })}
            </Text>

            <Box width={218} height="auto" alignItems="flex-start" bg="ink.background-secondary">
              <Text variant="code" textAlign="center">
                {error.message}
              </Text>
            </Box>
          </Box>
        </Box>
      </WidgetWrap>
    </PageLayout>
  );
}
