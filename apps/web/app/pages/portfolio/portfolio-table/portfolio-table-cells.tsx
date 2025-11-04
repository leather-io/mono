import { Box, Flex, styled } from 'leather-styles/jsx';

import { Sip10Asset, StxAsset, isStxAsset } from '@leather.io/models';
import {
  ArrowTriangleTopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HasChildren,
  Sip10AvatarIcon,
  StxAvatarIcon,
} from '@leather.io/ui';

import { SortState } from './utils';

interface PriceChangeCellProps {
  priceChange: number;
}

function getPriceChangeColor(priceChange: number) {
  if (priceChange > 0) {
    return 'green.action-primary-default';
  } else if (priceChange < 0) {
    return 'red.action-primary-default';
  } else {
    return 'ink.text-primary';
  }
}
export function PriceChangeCell({ priceChange }: PriceChangeCellProps) {
  const color = getPriceChangeColor(priceChange);
  return (
    <Flex alignItems="center" gap="space.01">
      <ArrowTriangleTopIcon
        color={color}
        width={8}
        height={8}
        style={{ transform: `rotate(${priceChange < 0 ? 180 : 0}deg)` }}
      />
      <styled.p textStyle="body.02" fontWeight="medium" color={color}>
        {priceChange.toFixed(2)}%
      </styled.p>
    </Flex>
  );
}

interface AssetCellProps {
  asset: Sip10Asset | StxAsset;
}
export function AssetCell({ asset }: AssetCellProps) {
  const isStx = isStxAsset(asset);
  const name = isStx ? 'Stacks' : asset.name;
  const symbol = asset.symbol;
  return (
    <Flex alignItems="center" gap="space.04">
      <Box>
        {isStx ? (
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
        <styled.p textStyle="body.02" fontWeight="medium">
          {name}
        </styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          {symbol}
        </styled.p>
      </Box>
    </Flex>
  );
}

export function TextCell({ children }: HasChildren) {
  return <styled.p textStyle="body.02">{children}</styled.p>;
}

interface BalanceCellProps {
  balance: string;
  value: string;
}
export function BalanceCell({ balance, value }: BalanceCellProps) {
  return (
    <Flex alignItems="flex-end" flexDir="column" gap="space.01">
      <styled.p textStyle="body.02">{value}</styled.p>
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {balance}
      </styled.span>
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
