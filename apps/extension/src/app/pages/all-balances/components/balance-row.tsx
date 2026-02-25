import { css } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';

import { InfoCircleIcon, ItemLayout } from '@leather.io/ui';

interface BalanceRowProps {
  label: string;
  fiatValue: string;
  cryptoValue: string;
  showChevron?: boolean;
  showInfoIcon?: boolean;
  onClick?(): void;
}

export function BalanceRow({
  label,
  fiatValue,
  cryptoValue,
  showChevron,
  showInfoIcon,
  onClick,
}: BalanceRowProps) {
  return (
    <button
      className={css({
        _hover: {
          backgroundColor: 'ink.component-background-hover',
        },
        py: 'space.03',
        px: 'space.02',
        borderRadius: 'xs',
        cursor: onClick ? 'pointer' : 'default',
      })}
      onClick={onClick}
    >
      <ItemLayout
        titleLeft={
          <Flex alignItems="center" gap="space.01">
            <styled.span textStyle="label.02">{label}</styled.span>
            {showInfoIcon && <InfoCircleIcon variant="small" />}
          </Flex>
        }
        titleRight={<styled.span textStyle="label.02">{fiatValue}</styled.span>}
        captionLeft={null}
        captionRight={cryptoValue}
        showChevron={showChevron}
      />
    </button>
  );
}
