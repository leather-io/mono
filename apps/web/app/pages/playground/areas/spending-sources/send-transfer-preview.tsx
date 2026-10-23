import { type MouseEvent, useState } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { link } from 'leather-styles/recipes';

import {
  AddressDisplayer,
  AnimalRabbitIcon,
  Approver,
  Avatar,
  BtcAvatarIcon,
  Button,
  Callout,
  Flag,
  ItemLayout,
  Logo,
  Pressable,
  QuestionCircleIcon,
  UserIcon,
  getAvatarUrl,
} from '@leather.io/ui';

import { EditSourcesSheet } from './edit-sources-sheet';
import { PopupFrame } from './popup-frame';
import type { AddressTypeId, SpendingScenario } from './spending-sources-mock-data';
import {
  type SpendPlan,
  type SpentFromType,
  feeRateLabel,
  formatBtc,
  formatUsd,
  getAccountBalanceSats,
  getDefaultAllowed,
  planSpend,
  truncateAddress,
} from './spending-sources.utils';

const connectDappsGuideUrl = 'https://leather.io/guides/connect-dapps';

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

function getAccountCaption(plan: SpendPlan) {
  const [firstType, ...otherTypes] = plan.spentByType;
  if (!firstType) return '';
  if (otherTypes.length > 0) return 'Multiple address types';
  return truncateAddress(firstType.address);
}

// The popup's logo band: the extension's Header (space.04) around Logo.
function LogoBand() {
  return (
    <styled.header p="space.04">
      <Box px="space.02">
        <Logo />
      </Box>
    </styled.header>
  );
}

interface AccountAvatarProps {
  seed: string;
  label: string;
}

// Same construction as the extension's AccountAvatar: the gradient image
// with the account number laid over it.
function AccountAvatar({ seed, label }: AccountAvatarProps) {
  return (
    <Box position="relative" width="48px" height="48px">
      <Avatar image={getAvatarUrl(seed)} size="xl" />
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        textStyle="label.01"
        pointerEvents="none"
      >
        {label}
      </Box>
    </Box>
  );
}

interface TaprootCalloutProps {
  onEditSources(): void;
}

// Callout has no action slot yet, so the actions ride in its children. A
// flex span keeps the markup valid inside Callout's own caption span.
function TaprootCallout({ onEditSources }: TaprootCalloutProps) {
  return (
    <Callout variant="warning" title="Some coins from a Taproot address">
      This BTC may carry inscriptions or runes. Spending it sends them along.
      <styled.span display="flex" mt="space.03">
        <styled.button
          type="button"
          className={link({ size: 'sm', variant: 'underlined' })}
          onClick={onEditSources}
        >
          Edit sources
        </styled.button>
      </styled.span>
    </Callout>
  );
}

interface SpentByTypeListProps {
  spentByType: SpentFromType[];
}

// Inputs consumed per address type. Change returns to the account, so these
// sum to slightly more than the amount sent.
function SpentByTypeList({ spentByType }: SpentByTypeListProps) {
  return (
    <Stack gap="space.01" pb="space.01">
      {spentByType.map(spent => (
        <Flex key={spent.id} justifyContent="space-between" gap="space.03">
          <styled.span textStyle="caption.01">{spent.label}</styled.span>
          <styled.span textStyle="caption.01">{formatBtc(spent.sats)}</styled.span>
        </Flex>
      ))}
    </Stack>
  );
}

interface SendTransferPreviewProps {
  scenario: SpendingScenario;
  // Opens the Edit sources sheet on mount with these types switched off
  sheet?: { excluded: AddressTypeId[] };
}

export function SendTransferPreview({ scenario, sheet }: SendTransferPreviewProps) {
  const { sources, amountSats } = scenario;
  const allTypes = sources.map(source => source.id);

  const [applied, setApplied] = useState<AddressTypeId[]>(() =>
    getDefaultAllowed({ sources, amountSats })
  );
  // null while the sheet is closed; otherwise the sheet's working selection
  const [draft, setDraft] = useState<AddressTypeId[] | null>(() => {
    if (!sheet) return null;
    return allTypes.filter(id => !sheet.excluded.includes(id));
  });

  const plan = planSpend({ sources, allowed: applied, amountSats });
  const spansMultipleTypes = plan.spentByType.length > 1;
  const touchesCollectibleRisk = plan.spentByType.some(spent => spent.mayHoldCollectibles);
  const balanceSats = getAccountBalanceSats(sources);

  function openSheet() {
    setDraft(applied);
  }

  function closeSheet() {
    setDraft(null);
  }

  function applyDraft() {
    if (draft) setApplied(draft);
    setDraft(null);
  }

  function toggleSource(id: AddressTypeId, isAllowed: boolean) {
    setDraft(current => {
      if (!current) return current;
      if (isAllowed) return allTypes.filter(type => type === id || current.includes(type));
      return current.filter(type => type !== id);
    });
  }

  return (
    <PopupFrame
      overlay={
        draft && (
          <EditSourcesSheet
            sources={sources}
            amountSats={amountSats}
            allowed={draft}
            onToggleSource={toggleSource}
            onCancel={closeSheet}
            onApply={applyDraft}
          />
        )
      }
    >
      <LogoBand />
      <Approver requester={scenario.requester} width="100%">
        <Approver.Header
          title="Send token"
          info={
            <styled.a
              display="block"
              p="space.01"
              target="_blank"
              rel="noreferrer"
              href={connectDappsGuideUrl}
            >
              <QuestionCircleIcon variant="small" />
            </styled.a>
          }
          onPressRequestedByLink={preventNavigation}
        />

        {touchesCollectibleRisk && <TaprootCallout onEditSources={openSheet} />}

        <Approver.Section>
          <Approver.Subheader>With account</Approver.Subheader>
          <Box mb="space.03">
            <ItemLayout
              img={<AccountAvatar seed={scenario.accountAvatarSeed} label="1" />}
              titleLeft={scenario.accountName}
              captionLeft={getAccountCaption(plan)}
              titleRight={formatBtc(balanceSats)}
              captionRight={formatUsd(balanceSats)}
            />
          </Box>
        </Approver.Section>

        <Approver.Section>
          <Flex alignItems="center" justifyContent="space-between">
            <Approver.Subheader>You'll send</Approver.Subheader>
            <styled.button
              type="button"
              className={link({ size: 'sm', variant: 'underlined' })}
              onClick={openSheet}
            >
              Edit sources
            </styled.button>
          </Flex>
          <Flag img={<BtcAvatarIcon />} align={spansMultipleTypes ? 'top' : 'middle'} width="100%">
            <Stack gap="space.03">
              <ItemLayout
                titleLeft="Bitcoin"
                captionLeft="Bitcoin blockchain"
                titleRight={formatBtc(amountSats)}
                captionRight={formatUsd(amountSats)}
              />
              {spansMultipleTypes && <SpentByTypeList spentByType={plan.spentByType} />}
            </Stack>
          </Flag>
          <Box bg="ink.border-default" height="1px" width="100%" mt="space.05" mb="space.04" />
          <Approver.Subheader>To address</Approver.Subheader>
          <HStack alignItems="center" gap="space.04" pb="space.03">
            <Avatar
              size="lg"
              bg="ink.component-background-hover"
              outlineColor="ink.component-background-hover"
              icon={<UserIcon />}
            />
            <AddressDisplayer address={scenario.recipient} />
          </HStack>
        </Approver.Section>

        <Approver.Section>
          <Pressable my="space.02">
            <ItemLayout
              img={
                <Avatar
                  size="lg"
                  bg="ink.component-background-hover"
                  outlineColor="ink.component-background-hover"
                  icon={<AnimalRabbitIcon />}
                />
              }
              showChevron
              titleLeft="Standard"
              captionLeft="~30 min"
              titleRight={formatBtc(plan.feeSats)}
              captionRight={`${feeRateLabel} · ${formatUsd(plan.feeSats)}`}
            />
          </Pressable>
        </Approver.Section>

        <Approver.Actions
          actions={[
            <Button key="cancel" variant="outline" fullWidth>
              Cancel
            </Button>,
            <Button key="approve" fullWidth>
              Approve
            </Button>,
          ]}
        >
          <HStack justify="space-between" mb="space.03">
            <styled.span textStyle="label.02">Total spend</styled.span>
            <styled.span textStyle="label.02">{formatUsd(amountSats + plan.feeSats)}</styled.span>
          </HStack>
        </Approver.Actions>
      </Approver>
    </PopupFrame>
  );
}
