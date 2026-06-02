import type { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { ChainPill } from '../components/chain-pill';
import { MultisigPageHeader } from '../components/multisig-page-header';
import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { SettingsRow } from './components/settings-row';

function SettingsSection({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Flex alignItems="center" gap="space.02" p="space.04">
        {head}
      </Flex>
      {children}
    </Box>
  );
}

function SortSelect() {
  return (
    <styled.select
      height="36px"
      width="180px"
      px="space.02"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      textStyle="body.02"
    >
      <option>Recent activity</option>
      <option>Largest balance</option>
      <option>Created date</option>
    </styled.select>
  );
}

function LandingSelect() {
  return (
    <styled.select
      height="36px"
      width="180px"
      px="space.02"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      textStyle="body.02"
    >
      <option>Dashboard</option>
      <option>Latest activity</option>
    </styled.select>
  );
}

function ChainSettings({ chain }: { chain: Chain }) {
  const label = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  return (
    <SettingsSection
      head={
        <>
          <ChainPill chain={chain} />
          <styled.span textStyle="label.01">{label} settings</styled.span>
        </>
      }
    >
      <SettingsRow
        title="Transaction proposal alerts"
        sub={`Notify me when a vault on ${label} has a new pending transaction.`}
        defaultOn
      />
      <SettingsRow
        title="Threshold-met alerts"
        sub="Notify me when a transaction reaches its signing threshold."
        defaultOn
      />
    </SettingsSection>
  );
}

export function MultisigSettingsPage() {
  return (
    <Page>
      <MultisigPageHeader title="Multisig settings" backTo={multisigPaths.index} />
      <Flex direction="column" gap="space.06" maxWidth="640px">
        <SettingsSection
          head={
            <>
              <styled.span textStyle="label.01">Notifications & display</styled.span>
              <styled.span textStyle="caption.01" color="ink.text-subdued" ml="auto">
                Stored locally
              </styled.span>
            </>
          }
        >
          <SettingsRow
            title="Daily activity digest"
            sub="A summary of vault activity each morning."
          />
          <SettingsRow
            title="Sort vaults by"
            sub="How vaults are ordered on your dashboard."
            trailing={<SortSelect />}
          />
          <SettingsRow
            title="Default landing tab"
            sub="Where Multisig opens to when you click it in the sidebar."
            trailing={<LandingSelect />}
          />
        </SettingsSection>

        <ChainSettings chain="btc" />
        <ChainSettings chain="stx" />
      </Flex>
    </Page>
  );
}
