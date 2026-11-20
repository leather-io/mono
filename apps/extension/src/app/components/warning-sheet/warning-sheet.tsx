import type { ReactNode } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { Button, Sheet } from '@leather.io/ui';

interface WarningSheetAction {
  label: string;
  onClick(): void;
  testId?: string;
}

interface WarningSheetProps {
  icon: ReactNode;
  title: string;
  body: ReactNode;
  primaryAction: WarningSheetAction;
  secondaryAction?: WarningSheetAction;
  isShowing: boolean;
  onClose(): void;
  'data-testid'?: string;
}

export function WarningSheet({
  icon,
  title,
  body,
  primaryAction,
  secondaryAction,
  isShowing,
  onClose,
  'data-testid': testId,
}: WarningSheetProps) {
  return (
    <Sheet
      variant="drawer"
      wrapChildren={false}
      title={title}
      isShowing={isShowing}
      onClose={onClose}
    >
      <Stack data-testid={testId} px="space.05" pt="space.06" pb="space.05" gap="space.05">
        <HStack gap="space.04" alignItems="center">
          <Flex
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            width="xxl"
            height="xxl"
            borderRadius="round"
            bg="ink.background-secondary"
          >
            {icon}
          </Flex>
          <styled.p textStyle="heading.05" color="ink.text-primary" margin="0" textWrap="pretty">
            {title}
          </styled.p>
        </HStack>
        <Box textStyle="body.01" color="ink.text-secondary">
          {body}
        </Box>
        <Stack gap="space.02" mt="space.02">
          <Button
            fullWidth
            onClick={primaryAction.onClick}
            data-testid={primaryAction.testId}
            type="button"
          >
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Button
              fullWidth
              variant="ghost"
              onClick={secondaryAction.onClick}
              data-testid={secondaryAction.testId}
              type="button"
            >
              {secondaryAction.label}
            </Button>
          )}
        </Stack>
      </Stack>
    </Sheet>
  );
}
