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
  asset: BtcAsset | Sip10Asset | StxAsset;
}
function getAssetName(asset: BtcAsset | Sip10Asset | StxAsset) {
  if (isBtcAsset(asset)) return 'Bitcoin';
  if (isStxAsset(asset)) return 'Stacks';
  return asset.name;
}

function AssetIcon({ asset }: AssetCellProps) {
  if (isBtcAsset(asset)) return <BtcAvatarIcon />;
  if (isStxAsset(asset)) return <StxAvatarIcon />;
  return (
    <Sip10AvatarIcon
      contractId={asset.contractId}
      imageCanonicalUri={asset.imageCanonicalUri}
      name={asset.name}
    />
  );
}

export function AssetCell({ asset }: AssetCellProps) {
  const name = getAssetName(asset);
  const symbol = asset.symbol;
  return (
    <Flex alignItems="center" gap="space.04">
      <Box>
        <AssetIcon asset={asset} />
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
