import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Link } from '@leather.io/ui';

interface ProtocolMetric {
  label: string;
  value: string;
}

interface ProtocolSectionProps {
  icon: React.ReactNode;
  name: string;
  type: string;
  externalUrl?: string;
  metrics?: ProtocolMetric[];
  totalValue: string;
  children: React.ReactNode;
}

function getMetricColor(label: string, value: string): string {
  if (label === 'LTV') return 'yellow.action-primary-default';
  if (label === 'APY' && parseFloat(value) > 0) return 'green.action-primary-default';
  return 'ink.text-primary';
}

export function ProtocolSection({
  icon,
  name,
  type,
  externalUrl,
  metrics = [],
  totalValue,
  children,
}: ProtocolSectionProps) {
  return (
    <Stack gap={0}>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        py="space.03"
        background="ink.component-background-hover"
        borderRadius="xs"
        px="space.03"
      >
        <Flex alignItems="center" gap="space.03" flex={1}>
          <Box flexShrink={0}>{icon}</Box>
          <Box minWidth={0} flex={1}>
            <Flex alignItems="center" gap="space.02">
              <styled.p textStyle="label.01" color="ink.text-primary">
                {name}
              </styled.p>
              {externalUrl && (
                <Box
                  border="1px solid"
                  borderColor="ink.border-default"
                  borderRadius="full"
                  px="space.02"
                  py="space.01"
                  display="flex"
                  alignItems="center"
                  gap="space.01"
                >
                  <Link href={externalUrl} target="_blank">
                    <styled.span textStyle="label.03" color="ink.text-subdued" cursor="pointer">
                      Open app
                    </styled.span>
                  </Link>
                  <styled.span textStyle="caption.01" color="ink.text-subdued">↗</styled.span>
                </Box>
              )}
            </Flex>
            <styled.p textStyle="caption.01" color="ink.text-primary">
              {type}
            </styled.p>
          </Box>
        </Flex>

        <Flex alignItems="center" gap={0}>
          {metrics.map((metric, index) => (
            <Box
              key={index}
              textAlign="center"
              px="space.05"
              py="space.03"
              display={['none', 'none', 'block']}
            >
              <styled.p textStyle="body.02" color={getMetricColor(metric.label, metric.value)}>
                {metric.value}
              </styled.p>
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                {metric.label}
              </styled.p>
            </Box>
          ))}

          <Box textAlign="right" pl="space.05">
            <styled.p textStyle="label.01" color="green.action-primary-default">
              {totalValue}
            </styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              Total
            </styled.p>
          </Box>
        </Flex>
      </Flex>

      <Box
        border="1px solid"
        borderColor="ink.border-default"
        borderRadius="xs"
        overflow="hidden"
        background="ink.border-default"
      >
        <Stack gap="1px">{children}</Stack>
      </Box>
    </Stack>
  );
}
