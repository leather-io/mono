import { useLocation, useNavigate } from 'react-router';

import { Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import type { StacksDerivationPathType } from '@leather.io/stacks';
import {
  ArrowsRepeatLeftRightIcon,
  Badge,
  InfoCircleIcon,
  ItemLayout,
  LedgerIcon,
  Link,
  Pressable,
  StacksIcon,
} from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { Divider } from '@app/components/layout/divider';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

const accountDiscoveryUrl = 'https://app.leather.io/posts/wallet-derivation-paths';

const stacksDerivationTooltip = `m/44'/5757'/0'/0/2`;

const ledgerCompatibilityTooltip = `m/44'/5757'/2'/0/0`;

function OptionIcon({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      bg="ink.background-secondary"
      width="40px"
      height="40px"
    >
      {children}
    </Flex>
  );
}

function IllustrationTile({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      border="default"
      borderRadius="lg"
      width="88px"
      height="88px"
    >
      {children}
    </Flex>
  );
}

interface TitleWithTooltipProps {
  title: string;
  tooltipLabel: string;
  badge?: React.ReactNode;
}
function TitleWithTooltip({ title, tooltipLabel, badge }: TitleWithTooltipProps) {
  return (
    <HStack gap="space.01" alignItems="center">
      <styled.span textStyle="label.02">{title}</styled.span>
      <BasicTooltip label={tooltipLabel} side="bottom" asChild>
        <styled.span display="inline-flex" alignItems="center" position="relative">
          <InfoCircleIcon color="ink.text-subdued" variant="small" />
        </styled.span>
      </BasicTooltip>
      {badge}
    </HStack>
  );
}

export function ChooseAddressStandard() {
  const navigate = useNavigate();
  const location = useLocation();

  function onSelectStandard(type: StacksDerivationPathType) {
    analytics.track('ledger_stacks_address_standard_selected', { type });
    void navigate(`../${RouteUrls.ConnectLedger}`, {
      replace: true,
      state: { ...location.state, stacksDerivationPathType: type },
    });
  }

  return (
    <Stack gap="space.00" px="space.06" pb="space.06" textAlign="left">
      <Flex justifyContent="center" mt="space.06" mb="space.07">
        <HStack gap="space.05" alignItems="center">
          <IllustrationTile>
            <StacksIcon />
          </IllustrationTile>
          <ArrowsRepeatLeftRightIcon variant="small" color="ink.text-subdued" />
          <IllustrationTile>
            <LedgerIcon />
          </IllustrationTile>
        </HStack>
      </Flex>
      <Stack gap="space.03" mb="space.06">
        <styled.h3 textStyle="heading.05">Preferred address standard</styled.h3>
      </Stack>
      <Stack gap="space.05" mb="space.06">
        <Pressable onClick={() => onSelectStandard('stacks')}>
          <ItemLayout
            img={
              <OptionIcon>
                <StacksIcon />
              </OptionIcon>
            }
            titleLeft={
              <TitleWithTooltip
                title="Legacy Stacks derivation paths"
                tooltipLabel={stacksDerivationTooltip}
                badge={<Badge label="Default" />}
              />
            }
            captionLeft="Used by most Stacks wallets"
            showChevron
            chevronDirection="right"
          />
        </Pressable>
        <Pressable onClick={() => onSelectStandard('ledgerLive')}>
          <ItemLayout
            img={
              <OptionIcon>
                <LedgerIcon />
              </OptionIcon>
            }
            titleLeft={
              <TitleWithTooltip
                title="Standard derivation paths"
                tooltipLabel={ledgerCompatibilityTooltip}
              />
            }
            captionLeft="Only if you have accounts in Ledger Live"
            showChevron
            chevronDirection="right"
          />
        </Pressable>
      </Stack>
      <Divider mx="-space.04" width="auto" />
      <Flex justifyContent="center" pt="space.05">
        <Link href={accountDiscoveryUrl} size="sm">
          Learn how Leather searches for accounts ↗
        </Link>
      </Flex>
    </Stack>
  );
}
