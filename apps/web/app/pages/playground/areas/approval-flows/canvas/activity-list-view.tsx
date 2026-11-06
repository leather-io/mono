import { Box, Grid, Stack, styled } from 'leather-styles/jsx';

import { SBTC_ASSET_ID_MAINNET, stxAsset } from '@leather.io/constants';
import type { BlockchainActivityAvatar, BlockchainActivityIndicator } from '@leather.io/features';
import type { Sip10Asset } from '@leather.io/models';
import {
  BlockchainActivityAvatarIcon,
  BlockchainActivityIndicatorIcon,
  ListItemBox,
} from '@leather.io/ui';

import {
  type ActivityListExample,
  activityListExamples,
  activityListSummary,
} from '../scenarios/activity-list-fixtures';
import { useCanvasSettings } from './canvas-settings';

const sbtcAsset: Sip10Asset = {
  chain: 'stacks',
  category: 'fungible',
  protocol: 'sip10',
  name: 'sBTC',
  symbol: 'sBTC',
  decimals: 8,
  hasMemo: true,
  canTransfer: true,
  assetId: SBTC_ASSET_ID_MAINNET,
  contractId: SBTC_ASSET_ID_MAINNET.split('::')[0] ?? '',
  imageCanonicalUri: '',
};

function detailsHref(example: ActivityListExample, theme: string) {
  return `?view=viewer&screen=${example.id}&direction=handshake&theme=${theme}`;
}

interface ActivityListRowProps {
  example: ActivityListExample;
  isMapped?: boolean;
}

function ActivityListRow({ example, isMapped = false }: ActivityListRowProps) {
  const { theme } = useCanvasSettings();
  const href = detailsHref(example, theme);
  const summary = activityListSummary(example);
  const asset = example.mappedAmount.symbol === 'sBTC' ? sbtcAsset : stxAsset;
  const avatar: BlockchainActivityAvatar = { kind: 'icon', icon: 'contract-call' };
  const mappedAvatar: BlockchainActivityAvatar =
    example.mapped === 'swap'
      ? {
          kind: 'pair',
          back: { asset: stxAsset, dimmed: false },
          front: { asset: sbtcAsset, dimmed: false },
        }
      : { kind: 'single', asset };
  const statusIndicator = example.state === 'confirmed' ? undefined : example.state;
  const indicator: BlockchainActivityIndicator = statusIndicator ?? 'function';
  const mappedIndicators: Record<ActivityListExample['mapped'], BlockchainActivityIndicator> = {
    receive: 'received',
    send: 'sent',
    swap: 'swap',
  };
  const mappedIndicator = statusIndicator ?? mappedIndicators[example.mapped];
  const hasMappedAmount = isMapped && example.mapped !== 'swap';
  const amount = hasMappedAmount
    ? `${example.mappedAmount.direction === 'in' ? '+' : '−'}${example.mappedAmount.amount} ${example.mappedAmount.symbol}`
    : summary?.amount;
  const caption = hasMappedAmount ? example.mappedAmount.fiat : summary?.caption;
  const isReceived = isMapped
    ? example.mappedAmount.direction === 'in'
    : summary?.direction === 'in';
  const confirmedAmountColor = isReceived ? 'green.action-primary-default' : 'ink.text-primary';
  const mappedTitle =
    example.mapped === 'swap' ? '100 STX → 0.00073 sBTC' : example.mappedAmount.symbol;
  const showAmount = !isMapped || hasMappedAmount;
  return (
    <ListItemBox
      href={href}
      onClick={() => window.location.assign(href)}
      leading={
        <BlockchainActivityAvatarIcon
          avatar={isMapped ? mappedAvatar : avatar}
          indicator={
            <BlockchainActivityIndicatorIcon
              indicator={isMapped ? mappedIndicator : indicator}
              size={12}
            />
          }
        />
      }
      title={
        <styled.span
          display="block"
          minWidth="0"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          textStyle="label.02"
          color={example.state === 'confirmed' ? 'ink.text-primary' : 'ink.text-subdued'}
        >
          {isMapped ? mappedTitle : example.functionName}
        </styled.span>
      }
      caption={isMapped ? 'Today, 12:00' : example.contractName}
      trailing={
        showAmount && amount ? (
          <styled.span
            textStyle="label.02"
            whiteSpace="nowrap"
            color={example.state === 'confirmed' ? confirmedAmountColor : 'ink.text-subdued'}
          >
            {amount}
          </styled.span>
        ) : undefined
      }
      trailingCaption={
        showAmount && caption ? (
          <styled.span textStyle="caption.01" whiteSpace="nowrap" color="ink.text-subdued">
            {caption}
          </styled.span>
        ) : undefined
      }
    />
  );
}

export function ActivityListView() {
  const { theme } = useCanvasSettings();
  return (
    <Stack
      as="section"
      className={theme === 'dark' ? 'dark' : undefined}
      bg="ink.background-primary"
      color="ink.text-primary"
      gap="space.07"
      py="space.07"
      maxWidth="1000px"
      mx="auto"
    >
      <Stack gap="space.03">
        <styled.h1 textStyle="heading.03">Activity list row</styled.h1>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Unmapped calls keep their contract identity and gain this account’s confirmed net balance
          change. Select either row to inspect the matching past-tense activity details.
          Illustrative data.
        </styled.p>
        <styled.a
          href="https://github.com/leather-io/mono/issues/2692#issuecomment-5625304304"
          textStyle="caption.01"
          textDecoration="underline"
        >
          Agreed rules · BTC &gt; STX &gt; sBTC &gt; USDCx &gt; the rest
        </styled.a>
      </Stack>
      {activityListExamples.map(example => (
        <Stack as="section" key={example.id} id={example.id} gap="space.03" minWidth="0">
          <styled.h2 textStyle="heading.05">{example.label}</styled.h2>
          <Grid columns={{ base: 1, lg: 2 }} gap="space.04" minWidth="0">
            <Stack gap="space.02" minWidth="0">
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                Unmapped · {example.state}
              </styled.p>
              <Box borderWidth={1} borderColor="ink.border-default" borderRadius="sm" minWidth="0">
                <ActivityListRow example={example} />
              </Box>
            </Stack>
            <Stack gap="space.02" minWidth="0">
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                {example.mappedLabel} · comparison
              </styled.p>
              <Box borderWidth={1} borderColor="ink.border-default" borderRadius="sm" minWidth="0">
                <ActivityListRow example={example} isMapped />
              </Box>
            </Stack>
          </Grid>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {example.note}
          </styled.p>
        </Stack>
      ))}
    </Stack>
  );
}
