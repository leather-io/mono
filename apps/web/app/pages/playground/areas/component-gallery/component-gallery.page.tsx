import type { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';

import type {
  AuthNetworkId,
  Vault,
  VaultAccount,
  VaultAccountSigner,
  VaultMember,
} from '@leather.io/models';
import { ListContainer, ListItemBox } from '@leather.io/ui';

import { AccountDetailsCard } from '../../../multisig/account/components/account-details-card';
import { AvatarCircle } from '../../../multisig/components/avatar-circle';
import { AvatarSq } from '../../../multisig/components/avatar-sq';
import { Badge, type BadgeVariant } from '../../../multisig/components/badge';
import { ChainAvatar } from '../../../multisig/components/chain-avatar';
import { ChainPill } from '../../../multisig/components/chain-pill';
import { MultisigErrorState } from '../../../multisig/components/multisig-error-state';
import { MultisigHero } from '../../../multisig/components/multisig-hero';
import { TextField } from '../../../multisig/components/text-field';
import { VaultActivityList } from '../../../multisig/components/vault-activity-list';
import { CreateVaultTile } from '../../../multisig/dashboard/components/create-vault-tile';
import { vaultThemeFromName } from '../../../multisig/multisig-tokens';
import { VaultStatusCard } from '../../../multisig/vault/components/vault-status-card';
import {
  mockAccountNames,
  mockAccountThresholds,
  mockActivityItems,
  mockVaultNames,
} from '../../data/activity-mock-data';

// Living playground area: every multisig view-surface and component permutation
// stacked on one page with mock data, so the real components can be eyeballed
// and tweaked without the wallet/backend gate.
const NETWORK: AuthNetworkId = 'stx:mainnet';
const ME = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G';
const ADDR_2 = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const ADDR_3 = 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R';

const members: VaultMember[] = [
  { membershipId: 'm1', address: ME, name: 'Me', membershipStatus: 'joined', user: null },
  { membershipId: 'm2', address: ADDR_2, name: 'Amber', membershipStatus: 'joined', user: null },
  { membershipId: 'm3', address: ADDR_3, name: 'Jane', membershipStatus: 'joined', user: null },
];

const vault: Vault = {
  id: 'vault-preview',
  name: 'Team Treasury',
  theme: 'Orange',
  icon: null,
  network: NETWORK,
  status: 'active',
  createdBy: 'u0',
  createdAt: '',
  members,
};

const signers: VaultAccountSigner[] = members.map((member, index) => ({
  network: NETWORK,
  publicKey: '',
  address: member.address,
  id: `signer-${index}`,
  userId: `u${index}`,
  xpub: null,
  xpubOriginFingerprint: null,
  xpubOriginPath: null,
  signerIndex: index,
  signingPubkey: '',
}));

const account: VaultAccount = {
  id: 'account-preview',
  vaultId: vault.id,
  name: 'Operating account',
  icon: 'piggybank',
  network: NETWORK,
  threshold: 2,
  multisigAddress: 'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQABCDEFG',
  accountIndex: 0,
  createdAt: '',
  signers,
  pendingTransactionCount: 1,
  queuedTransactionCount: 0,
};

const orangeTheme = vaultThemeFromName('Orange').id;
const blueTheme = vaultThemeFromName('Blue').id;

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <Box mb="space.11">
      <styled.h2
        textStyle="heading.05"
        mb="space.01"
        pb="space.02"
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderBottomColor="ink.border-default"
      >
        {title}
      </styled.h2>
      {note && (
        <styled.p textStyle="caption.01" color="ink.text-subdued" mb="space.05">
          {note}
        </styled.p>
      )}
      <Box mt="space.05">{children}</Box>
    </Box>
  );
}

function Slot({ label, width, children }: { label: string; width?: string; children: ReactNode }) {
  return (
    <Box width={width ?? '420px'} maxWidth="100%">
      <styled.div textStyle="caption.01" color="ink.text-subdued" mb="space.02">
        {label}
      </styled.div>
      {children}
    </Box>
  );
}

const badgeVariants: BadgeVariant[] = ['default', 'error', 'info', 'pending', 'success', 'warning'];

export function ComponentGalleryPage() {
  return (
    <Box p="space.07" maxWidth="1100px">
      <styled.h1 textStyle="heading.04" mb="space.02">
        Multisig component gallery
      </styled.h1>
      <styled.p textStyle="caption.01" color="ink.text-subdued" mb="space.09">
        Every surface + permutation stacked with mock data. Living playground area.
      </styled.p>

      <Section
        title="Balance heroes"
        note="Account, vault and tx-detail share the bold MultisigHero (variant=balance). Tx-detail adds a proposer byline below the title."
      >
        <Flex direction="column" gap="space.05" maxWidth="640px">
          <Slot label="Account hero — balance variant" width="100%">
            <MultisigHero
              variant="balance"
              themeId={orangeTheme}
              primary={<styled.span>1,250.00 STX</styled.span>}
              secondary={<styled.span>$2,318.40</styled.span>}
            />
          </Slot>
          <Slot label="Vault hero — balance variant (shows a value here)" width="100%">
            <MultisigHero
              variant="balance"
              themeId={blueTheme}
              primary={<styled.span>0.0452 BTC</styled.span>}
              secondary={<styled.span>$3,140.00</styled.span>}
            />
          </Slot>
          <Slot label="Tx-detail hero — balance variant" width="100%">
            <MultisigHero
              variant="balance"
              themeId={orangeTheme}
              primary={<styled.span>Send STX</styled.span>}
            >
              <styled.div mt="space.02" textStyle="label.02">
                <Flex alignItems="center" gap="space.02">
                  <styled.span>Proposed 2h ago by</styled.span>
                  <AvatarCircle name="Amber" size="sm" />
                  <styled.span>Amber</styled.span>
                </Flex>
              </styled.div>
            </MultisigHero>
          </Slot>
        </Flex>
      </Section>

      <Section title="Detail cards" note="The two sidebar cards, side by side.">
        <Flex gap="space.06" flexWrap="wrap" alignItems="flex-start">
          <Slot label="AccountDetailsCard">
            <AccountDetailsCard
              vault={vault}
              account={account}
              currentUserAddress={ME}
              onAddToWallet={() => undefined}
            />
          </Slot>
          <Slot label="VaultStatusCard">
            <VaultStatusCard
              vault={vault}
              canCancel={false}
              isCancelling={false}
              pendingCount={0}
              onShareInvite={() => undefined}
              onCancelVault={() => undefined}
            />
          </Slot>
        </Flex>
      </Section>

      <Section
        title="Activity feed"
        note="VaultActivityList: two-line rows in a flat tiered feed (Needs signatures / In progress / History). Transaction detail leads the row; the vault account name + signature progress sit beneath. Review CTA + attention wash on actionable rows; crypto value leading (precision policy), fiat beneath. Tier labels are dropped when only one tier has items."
      >
        <Flex gap="space.08" flexWrap="wrap" alignItems="flex-start">
          <Slot label="dashboard context (vault names)" width="480px">
            <VaultActivityList
              items={mockActivityItems}
              scale="compact"
              vaultNamesById={mockVaultNames}
              accountNamesById={mockAccountNames}
              accountThresholdsById={mockAccountThresholds}
              onSelect={() => undefined}
            />
          </Slot>
          <Slot label="account context (no location)" width="480px">
            <VaultActivityList
              items={mockActivityItems}
              scale="compact"
              onSelect={() => undefined}
            />
          </Slot>
          <Slot label="single tier (history only) — no labels" width="480px">
            <VaultActivityList
              items={mockActivityItems.filter(item => item.view.status === 'success')}
              scale="compact"
              vaultNamesById={mockVaultNames}
              accountNamesById={mockAccountNames}
              accountThresholdsById={mockAccountThresholds}
              onSelect={() => undefined}
            />
          </Slot>
        </Flex>
      </Section>

      <Section
        title="ListItemBox primitive"
        note="The shared row: density (default / compact) × highlight (plain / attention), with leading + trailing."
      >
        <Flex gap="space.08" flexWrap="wrap" alignItems="flex-start">
          <Slot label="density=default">
            <ListContainer>
              <ListItemBox
                leading={<ChainAvatar chain="stx" size="lg" />}
                title={<styled.span textStyle="label.02">Plain row</styled.span>}
                caption="Supporting caption"
                trailing={<styled.span textStyle="label.02">12.50</styled.span>}
                onClick={() => undefined}
              />
              <ListItemBox
                leading={<ChainAvatar chain="btc" size="lg" />}
                title={<styled.span textStyle="label.02">Attention row</styled.span>}
                caption="Needs action"
                highlight="attention"
                onClick={() => undefined}
              />
            </ListContainer>
          </Slot>
          <Slot label="density=compact">
            <ListContainer>
              <ListItemBox
                density="compact"
                leading={<ChainAvatar chain="stx" size="md" />}
                title={<styled.span textStyle="label.03">Plain row</styled.span>}
                caption="Supporting caption"
                trailing={<styled.span textStyle="label.03">12.50</styled.span>}
                onClick={() => undefined}
              />
              <ListItemBox
                density="compact"
                leading={<ChainAvatar chain="btc" size="md" />}
                title={<styled.span textStyle="label.03">Attention row</styled.span>}
                caption="Needs action"
                highlight="attention"
                onClick={() => undefined}
              />
            </ListContainer>
          </Slot>
        </Flex>
      </Section>

      <Section title="Badges" note="All status variants.">
        <Flex gap="space.03" flexWrap="wrap" alignItems="center">
          {badgeVariants.map(v => (
            <Badge key={v} variant={v} label={v} />
          ))}
        </Flex>
      </Section>

      <Section
        title="Avatars & pills"
        note="AvatarCircle (sizes), AvatarSq (icons/chains/badge), ChainAvatar, ChainPill."
      >
        <Flex direction="column" gap="space.06">
          <Slot label="AvatarCircle — xs / sm / md / lg / xl" width="100%">
            <Flex gap="space.04" alignItems="center">
              {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => (
                <AvatarCircle key={s} name="Amber" size={s} />
              ))}
            </Flex>
          </Slot>
          <Slot label="AvatarSq — chains / icons / chain badge" width="100%">
            <Flex gap="space.04" alignItems="center">
              <AvatarSq chain="stx" icon="vault" themeId={orangeTheme} size="lg" />
              <AvatarSq chain="btc" icon="vault" themeId={blueTheme} size="lg" />
              <AvatarSq
                chain="stx"
                icon="piggybank"
                themeId={orangeTheme}
                size="md"
                withChainBadge
              />
              <AvatarSq chain="btc" icon="piggybank" themeId={blueTheme} size="sm" />
            </Flex>
          </Slot>
          <Slot label="ChainAvatar — sizes / chains" width="100%">
            <Flex gap="space.04" alignItems="center">
              <ChainAvatar chain="stx" size="sm" />
              <ChainAvatar chain="stx" size="md" />
              <ChainAvatar chain="btc" size="lg" />
            </Flex>
          </Slot>
          <Slot label="ChainPill" width="100%">
            <Flex gap="space.04" alignItems="center">
              <ChainPill chain="stx" />
              <ChainPill chain="btc" />
              <ChainPill chain="btc" logo />
            </Flex>
          </Slot>
        </Flex>
      </Section>

      <Section
        title="CopyAddress"
        note="One muted style for truncated + full; grouped is the multi-line block with the icon trailing the address. Wide fills the available width and middle-truncates only when the container is too tight — never wrapping."
      >
        <Flex direction="column" gap="space.03" maxWidth="520px" alignItems="flex-start">
          <CopyAddress addr={ME} />
          <CopyAddress addr={ME} full />
          <CopyAddress addr={ME} grouped />
        </Flex>
        <Flex direction="column" gap="space.02" mt="space.05" alignItems="flex-start">
          <Flex
            width="440px"
            borderRadius="sm"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="ink.border-transparent"
          >
            <CopyAddress addr={ME} wide />
          </Flex>
          <Flex
            width="300px"
            borderRadius="sm"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="ink.border-transparent"
          >
            <CopyAddress addr={ME} wide />
          </Flex>
          <Flex
            width="200px"
            borderRadius="sm"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="ink.border-transparent"
          >
            <CopyAddress addr={ME} wide />
          </Flex>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            wide — one address in 440 / 300 / 200px containers
          </styled.span>
        </Flex>
      </Section>

      <Section title="Form fields & states" note="TextField, CreateVaultTile, error state.">
        <Flex gap="space.06" flexWrap="wrap" alignItems="flex-start">
          <Slot label="TextField">
            <Flex direction="column" gap="space.04">
              <TextField label="Vault name" value="Team Treasury" onChange={() => undefined} />
              <TextField
                label="Address"
                value="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G"
                mono
                onChange={() => undefined}
              />
              <TextField
                label="Invalid"
                value="not-an-address"
                invalid
                help="Enter a valid address"
                onChange={() => undefined}
              />
            </Flex>
          </Slot>
          <Slot label="CreateVaultTile">
            <CreateVaultTile onClick={() => undefined} />
          </Slot>
          <Slot label="MultisigErrorState">
            <MultisigErrorState body="No vault found. It may not exist, or you may not be a member." />
          </Slot>
        </Flex>
      </Section>
    </Box>
  );
}
