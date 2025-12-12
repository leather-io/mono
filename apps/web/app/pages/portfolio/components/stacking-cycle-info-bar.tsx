import { Box, Flex, styled } from 'leather-styles/jsx';

import { ArrowsRepeatLeftRightIcon, InfoCircleIcon } from '@leather.io/ui';

interface StackingCycleInfoBarProps {
  daysUntilNextCycle: number;
  totalStxStacked: string;
  totalValueStacked: string;
}

export function StackingCycleInfoBar({
  daysUntilNextCycle,
  totalStxStacked,
  totalValueStacked,
}: StackingCycleInfoBarProps) {
  return (
    <Flex
      alignItems={['flex-start', 'center']}
      justifyContent="space-between"
      px="space.05"
      py="space.04"
      background="ink.component-background-default"
      border="default"
      borderRadius="xs"
      flexDirection={['column', 'row']}
      gap={['space.02', 'space.00']}
    >
      <Flex
        alignItems={['flex-start', 'center']}
        gap={['space.03', 'space.05']}
        flexDirection={['column', 'row']}
        flex={1}
      >
        <Flex alignItems="center" gap="space.03">
          <ArrowsRepeatLeftRightIcon />
          <styled.span textStyle="label.03" color="ink.text-primary">
            The next stacking cycle starts in ~ {daysUntilNextCycle} days
          </styled.span>
        </Flex>

        <Flex alignItems="center" gap="space.03">
          <Box
            width="1px"
            height="20px"
            background="ink.border-default"
            display={['none', 'block']}
          />
          <styled.span textStyle="label.03" color="ink.text-primary">
            {totalStxStacked} STX / {totalValueStacked} Stacked
          </styled.span>
        </Flex>
      </Flex>

      <InfoCircleIcon variant="small" color="ink.text-subdued" />
    </Flex>
  );
}
