import type { ReactNode } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Box, Flex, styled } from 'leather-styles/jsx';
import {
  type VaultAssetActivity,
  useVaultAssetActivity,
} from '~/features/multisig/assets/use-vault-asset-activity';
import type { VaultAssetItem } from '~/features/multisig/assets/vault-asset-items';
import { useUserSettings } from '~/hooks/use-user-settings';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';
import { formatCurrency } from '~/utils/currency-formatter';

import { formatPriceChangeText, getPriceChangeColor } from '@leather.io/features';
import type { VaultAccount } from '@leather.io/models';
import {
  createFungibleAssetDescriptionQueryConfig,
  createMarketStatsQueryConfig,
} from '@leather.io/queries';
import { AssetAvatarIcon, Button, CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { CopyAddress } from '../../components/copy-address';
import { VaultActivityList } from '../../components/vault-activity-list';

const recentActivityLimit = 10;

interface AssetDetailModalProps {
  account: VaultAccount;
  item: VaultAssetItem;
  onClose(): void;
  onSend(item: VaultAssetItem): void;
  onReceive(): void;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <Box
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderColor="ink.border-default"
      pt="space.04"
      mt="space.04"
    >
      <styled.h3 textStyle="label.02" color="ink.text-primary" mb="space.03">
        {title}
      </styled.h3>
      {children}
    </Box>
  );
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap="space.04"
      py="space.01"
      height="30px"
    >
      <styled.span textStyle="label.03" color="ink.text-subdued" flexShrink={0}>
        {label}
      </styled.span>
      <styled.span textStyle="caption.01" textAlign="right" minWidth={0}>
        {children}
      </styled.span>
    </Flex>
  );
}

interface DescriptionSectionProps {
  isPending: boolean;
  text: string | null | undefined;
}

function DescriptionSection({ isPending, text }: DescriptionSectionProps) {
  if (isPending) {
    return (
      <Section title="Description">
        <Flex direction="column" gap="space.02">
          <Box
            height="14px"
            borderRadius="sm"
            bg="ink.component-background-default"
            opacity={0.6}
          />
          <Box
            height="14px"
            width="60%"
            borderRadius="sm"
            bg="ink.component-background-default"
            opacity={0.6}
          />
        </Flex>
      </Section>
    );
  }

  if (!text) return null;

  return (
    <Section title="Description">
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        {text}
      </styled.p>
    </Section>
  );
}

interface PriceChangeProps {
  change: number | null | undefined;
}

function PriceChange({ change }: PriceChangeProps) {
  if (change === null || change === undefined) return <>—</>;
  return (
    <styled.span color={getPriceChangeColor(change)} fontWeight={change === 0 ? undefined : 500}>
      {formatPriceChangeText({ changePercent: change })}
    </styled.span>
  );
}

interface RecentActivityProps {
  activity: VaultAssetActivity;
}

function RecentActivity({ activity }: RecentActivityProps) {
  if (activity.isPending) {
    return (
      <Flex direction="column" gap="space.03">
        {[0, 1].map(index => (
          <Box
            key={index}
            height="56px"
            borderRadius="md"
            bg="ink.component-background-default"
            opacity={0.6}
          />
        ))}
      </Flex>
    );
  }

  if (activity.views.length === 0) {
    return (
      <Box
        borderRadius="md"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="ink.border-default"
        p="space.05"
        textAlign="center"
      >
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          No activity yet.
        </styled.span>
      </Box>
    );
  }

  return (
    <VaultActivityList
      items={activity.views.map(view => ({ view }))}
      limit={recentActivityLimit}
      onSelect={() => undefined}
    />
  );
}

export function AssetDetailModal({
  account,
  item,
  onClose,
  onSend,
  onReceive,
}: AssetDetailModalProps) {
  const settings = useUserSettings();
  const { asset } = item;
  const canSend =
    asset.protocol === 'nativeStx' ||
    asset.protocol === 'nativeBtc' ||
    item.crypto.amount.isGreaterThan(0);

  const description = useQuery(createFungibleAssetDescriptionQueryConfig(asset, settings));
  const marketData = useMarketDataQuery(asset);
  const marketStats = useQuery(createMarketStatsQueryConfig(asset, settings));
  const activity = useVaultAssetActivity(account, asset);

  return (
    <Sheet
      isShowing
      onClose={onClose}
      wrapChildren={false}
      header={
        <Flex justifyContent="flex-end" px="space.03" py="space.03" width="100%">
          <IconButton icon={<CloseIcon />} onClick={onClose} />
        </Flex>
      }
    >
      <Box
        px="space.05"
        pb="space.05"
        flex={{ base: '1', md: 'none' }}
        height={{ md: '70vh' }}
        minHeight={0}
        overflowY="auto"
      >
        <Flex direction="column" alignItems="center" gap="space.03" pb="space.04">
          <AssetAvatarIcon asset={asset} size="xl" />
          <Flex direction="column" alignItems="center" gap="space.00" textAlign="center">
            <styled.div textStyle="heading.03">
              {formatCurrency(item.crypto, { showCurrency: false })}
              <styled.span color="ink.text-subdued"> {asset.symbol.toUpperCase()}</styled.span>
            </styled.div>
            <styled.div textStyle="label.01" color="ink.text-primary">
              {formatCurrency(item.fiat)}
            </styled.div>
          </Flex>
          <Flex gap="space.03" justifyContent="center" pt="space.02">
            <Button
              variant="outline"
              size="md"
              px="space.04"
              disabled={!canSend}
              onClick={() => onSend(item)}
            >
              Send
            </Button>
            <Button variant="outline" size="md" onClick={onReceive}>
              Receive
            </Button>
          </Flex>
        </Flex>

        <DescriptionSection
          isPending={description.isPending}
          text={description.data?.description}
        />

        <Section title="Token details">
          <DetailRow label="Name">{asset.name}</DetailRow>
          <DetailRow label="Price">
            {marketData.data ? formatCurrency(marketData.data.price) : '—'}
          </DetailRow>
          <DetailRow label="Price change (24h)">
            <PriceChange change={marketStats.data?.priceChange?.['1d']} />
          </DetailRow>
          {asset.protocol === 'sip10' ? (
            <DetailRow label="Contract">
              <CopyAddress addr={asset.contractId} />
            </DetailRow>
          ) : null}
        </Section>

        <Section title="Recent activity">
          <RecentActivity activity={activity} />
        </Section>
      </Box>
    </Sheet>
  );
}
