import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';

import { InfoCircleIcon, ItemLayout, Pressable } from '@leather.io/ui';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

interface BalanceRowProps {
  label: string;
  fiatValue: string;
  cryptoValue: string;
  showChevron?: boolean;
  dataTestId?: string;
  onClick?(): void;
  tooltipText?: string;
}

export function BalanceRow({
  label,
  fiatValue,
  cryptoValue,
  showChevron,
  dataTestId,
  onClick,
  tooltipText,
}: BalanceRowProps) {
  return (
    <Pressable my="space.03" onClick={onClick} data-testid={dataTestId}>
      <ItemLayout
        titleLeft={
          <Flex alignItems="center" gap="space.01">
            <styled.span textStyle="label.02">{label}</styled.span>
            {tooltipText && (
              <BasicTooltip
                className={css({
                  zIndex: '10',
                })}
                label={tooltipText}
                side="top"
                asChild
              >
                <InfoCircleIcon variant="small" />
              </BasicTooltip>
            )}
          </Flex>
        }
        titleRight={<styled.span textStyle="label.02"> {fiatValue}</styled.span>}
        captionLeft={null}
        captionRight={cryptoValue}
        showChevron={showChevron}
      />
    </Pressable>
  );
}
