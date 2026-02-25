import { type ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Callout, InfoCircleIcon, Spinner } from '@leather.io/ui';

interface ProtocolSectionProps {
  icon: ReactNode;
  label: string;
  totalFiatValue: string;
  summary: string;
  isLoading?: boolean;
  warningMessage?: string;
  children: ReactNode;
}

export function ProtocolSection({
  icon,
  label,
  totalFiatValue,
  summary,
  isLoading,
  warningMessage,
  children,
}: ProtocolSectionProps) {
  return (
    <Stack gap="space.03" py="space.04">
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Stack gap="space.01">
          <Flex alignItems="center" gap="space.01">
            <styled.span textStyle="label.02" color="ink.text-subdued">
              {label}
            </styled.span>
            <InfoCircleIcon variant="small" />
          </Flex>
          <styled.span textStyle="heading.04">{totalFiatValue}</styled.span>
          <Flex alignItems="center" gap="space.02">
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {summary}
            </styled.span>
            {isLoading && <Spinner size="xs" />}
          </Flex>
        </Stack>
        {icon}
      </Flex>
      {warningMessage && <Callout variant="warning">{warningMessage}</Callout>}
      <Stack gap="space.01">{children}</Stack>
    </Stack>
  );
}
