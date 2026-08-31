import { Box, Flex, styled } from 'leather-styles/jsx';

import { InfoCircleIcon, ItemLayout, Pressable } from '@leather.io/ui';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { BalanceAmount } from './balance-amount';

interface BalanceRowProps {
  label: string;
  fiatValue: string;
  cryptoValue: string;
  isLoading?: boolean;
  dataTestId?: string;
  onClick?(): void;
  tooltipText?: string;
}

export function BalanceRow({
  label,
  fiatValue,
  cryptoValue,
  isLoading,
  dataTestId,
  onClick,
  tooltipText,
}: BalanceRowProps) {
  const itemLayout = (
    <ItemLayout
      titleLeft={
        <Flex alignItems="center" gap="space.01">
          <styled.span textStyle="label.02">{label}</styled.span>
          {tooltipText && (
            <BasicTooltip label={tooltipText} side="top" asChild>
              <InfoCircleIcon color="ink.text-subdued" variant="small" />
            </BasicTooltip>
          )}
        </Flex>
      }
      titleRight={
        <BalanceAmount
          textStyle="label.02"
          value={fiatValue}
          isLoading={isLoading}
          skeletonWidth="64px"
          skeletonHeight="20px"
        />
      }
      captionLeft={null}
      captionRight={
        <BalanceAmount
          textStyle="caption.01"
          color="ink.text-subdued"
          value={cryptoValue}
          isLoading={isLoading}
          skeletonWidth="48px"
          skeletonHeight="16px"
        />
      }
      showChevron={!!onClick}
      chevronDirection="right"
    />
  );

  if (!onClick)
    return (
      <Box my="space.03" width="100%" data-testid={dataTestId}>
        {itemLayout}
      </Box>
    );

  return (
    <Pressable my="space.03" onClick={onClick} data-testid={dataTestId}>
      {itemLayout}
    </Pressable>
  );
}
