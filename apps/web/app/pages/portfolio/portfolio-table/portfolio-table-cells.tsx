import { Box, Flex, styled } from 'leather-styles/jsx';

import { BtcAsset, Sip10Asset, StxAsset, isBtcAsset, isStxAsset } from '@leather.io/models';
import {
  ArrowTriangleTopIcon,
  BtcAvatarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HasChildren,
  Sip10AvatarIcon,
  StxAvatarIcon,
} from '@leather.io/ui';

import { EmptyAmountPlaceholder } from '../portfolio.page';
import { SortState } from './utils';

interface PriceChangeCellProps {
  priceChange?: number;
  isLoading?: boolean;
}

function getPriceChangeColor(priceChange: number) {
  if (priceChange > 0) {
    return 'green.action-primary-default';
  } else if (priceChange < 0) {
    return 'red.action-primary-default';
  } else {
    return 'ink.text-subdued';
  }
}

//  all numbers should be right aligned
export function PriceChangeCell({ priceChange, isLoading }: PriceChangeCellProps) {
  if (isLoading || priceChange === undefined) {
    return (
      <styled.p textStyle="label.02" color="ink.text-subdued">
        {`${EmptyAmountPlaceholder}`}
      </styled.p>
    );
  }

  const color = getPriceChangeColor(priceChange);
  const shouldShowArrow = priceChange !== 0;

  return (
    <Flex alignItems="center" gap="space.01" justifyContent="flex-end">
      {shouldShowArrow && (
        <ArrowTriangleTopIcon
          color={color}
          width={8}
          height={8}
          style={{ transform: `rotate(${priceChange < 0 ? 180 : 0}deg)` }}
        />
      )}
      <styled.p textStyle="label.02" fontWeight="medium" color={color}>
        {priceChange.toFixed(2)}%
      </styled.p>
    </Flex>
  );
}

interface AssetCellProps {
  asset: BtcAsset | Sip10Asset | StxAsset;
}
export function AssetCell({ asset }: AssetCellProps) {
  const isBtc = isBtcAsset(asset);
  const isStx = isStxAsset(asset);
  const name = isBtc ? 'Bitcoin' : isStx ? 'Stacks' : asset.name;
  const symbol = asset.symbol;
  return (
    <Flex alignItems="center" gap="space.04">
      <Box>
        {isBtc ? (
          <BtcAvatarIcon />
        ) : isStx ? (
          <StxAvatarIcon />
        ) : (
          <Sip10AvatarIcon
            contractId={asset.contractId}
            imageCanonicalUri={asset.imageCanonicalUri}
            name={asset.name}
          />
        )}
      </Box>
      <Box>
        <styled.p textStyle="label.01" fontWeight="medium">
          {name}
        </styled.p>
        <styled.p textStyle="caption.01">{symbol}</styled.p>
      </Box>
    </Flex>
  );
}

export function TextCell({ children }: HasChildren) {
  return (
    <styled.p textStyle="label.02" textAlign="right">
      {children}
    </styled.p>
  );
}

interface BalanceCellProps {
  balance: string;
  value: string;
}
export function BalanceCell({ balance, value }: BalanceCellProps) {
  return (
    <Flex alignItems="flex-end" flexDir="column">
      <styled.p textStyle="label.02">{value}</styled.p>
      <styled.span textStyle="caption.01">{balance}</styled.span>
    </Flex>
  );
}

interface HeaderCellProps {
  children: React.ReactNode;
  justifyContent: string;
  sortState: SortState;
}
export function HeaderCell({ children, justifyContent, sortState }: HeaderCellProps) {
  return (
    <Flex alignItems="center" gap="space.01" justifyContent={justifyContent}>
      {children}
      {sortState === 'desc' && <ChevronDownIcon variant="small" color="ink.text-subdued" />}
      {sortState === 'asc' && <ChevronUpIcon variant="small" color="ink.text-subdued" />}
    </Flex>
  );
}
