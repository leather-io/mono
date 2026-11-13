import { Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, StxAvatarIcon } from '@leather.io/ui';

import { decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { displayOrigin, truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import {
  AccountAvatar,
  ApprovalAccountPicker,
  OriginName,
  RequesterIcon,
} from '../pattern/approval-identity';
import { ApprovalNote, ApprovalPermission } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalSwitchRow } from '../pattern/approval-switch-row';
import {
  account1,
  account1Stx,
  account3,
  bitflow,
  feeUnderOneCent,
  gamma,
  mainnet,
  newSite,
  stxRecipient,
  zest,
} from './fixtures';
import type { Scenario } from './scenario';

export const sip030Scenarios: Scenario[] = [
  {
    id: 'sip030-get-accounts',
    family: 'sip-030',
    label: 'Connect with app storage access',
    method: 'stx_getAccounts · not implemented today',
    refs: ['#2708', '#2808'],
    note: 'SIP-030 lets a site ask for accounts instead of addresses. Each account comes with a private key made for that one site and the address of its Gaia storage hub, so the site can read and write its own data for you. That is more than an address, so the screen names the key and what it can’t do. The answer is Stacks only, so the account line drops the Bitcoin address that Connect shows. Leather has no handler for this method yet, and which storage hub Leather hands out is still open.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Connect Account 1" />}>
          <ApprovalHeader requester={newSite} network={mainnet} />
          <ApprovalIntent
            title="Connect this site to Leather"
            kind="It is asking for your Stacks account and a key for its own storage"
          />
          <ApprovalSection label="Account">
            <ApprovalAccountPicker
              account={account1}
              caption={`Stacks · ${truncateMiddle(account1.address, 4)}`}
            />
          </ApprovalSection>
          <ApprovalSection label="This site will be able to" divided>
            <ApprovalPermission>
              See your Stacks address, public key and balances
            </ApprovalPermission>
            <ApprovalPermission>
              Save and read its own data for you, with a key made only for this site
            </ApprovalPermission>
            <ApprovalPermission>
              Know when you switch account or network in Leather
            </ApprovalPermission>
            <ApprovalPermission kind="cannot">
              The site key can’t move funds or sign transactions. Those still ask you first
            </ApprovalPermission>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Storage hub, site key">
            <ApprovalRow label="Storage hub" value="hub.blockstack.org" caption="Gaia" />
            <ApprovalRow
              label="Site key"
              value="Only for app.bitflow.finance"
              caption="Derived from Account 1, not its spending key"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sip030-update-profile',
    family: 'sip-030',
    label: 'Update your public profile',
    method: 'stx_updateProfile · not implemented today',
    refs: ['#2808'],
    note: 'The site proposes new profile fields and the screen lists each change against what is there now, so nothing is replaced unseen. The profile is public, so the screen says who can see it. Leather advertises this method to sites but has no handler, so every call fails today. Leather’s own schema types the answer as a transaction, while SIP-030 returns the saved profile; the screen assumes the SIP-030 reading, with no fee and nothing on chain.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Update profile" />}>
          <ApprovalHeader requester={gamma} account={account1} network={mainnet} />
          <ApprovalIntent
            title="Update your public profile"
            kind="Profile · no fee, nothing is sent on chain"
          />
          <ApprovalSection label="What changes">
            <ApprovalRow label="Name" value="Fab" caption="Now: not set" />
            <ApprovalRow
              label="Description"
              value="Designing Bitcoin wallets"
              caption="Now: not set"
            />
            <ApprovalRow label="Image" value="avatar.png" caption="Now: Leather default" />
            <ApprovalRow label="Website" value="fab.design" caption="Now: stays the same" />
          </ApprovalSection>
          <ApprovalSection label="Who can see it" divided>
            <ApprovalRow
              label="Visible to"
              value="Anyone"
              caption="Any site or person who looks up Account 1"
            />
            <ApprovalRow label="Stored in" value="Your Gaia storage" caption="hub.blockstack.org" />
          </ApprovalSection>
          <ApprovalNote>You can change or clear these fields again later.</ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sip030-sign-and-broadcast',
    family: 'sip-030',
    label: 'Sign a transaction the app built and send it',
    method: 'stx_signTransaction · broadcast: true',
    refs: ['#2399'],
    events: [
      viewed('stx_signTransaction', 'sign_transaction', 'note'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'SIP-030 lets the app ask Leather to send the transaction after signing. The button then says Sign and send, and the title says it will go out, unlike the sign-only screen. Today Leather drops the broadcast flag, so the app always gets a signed transaction back and has to send it itself. Everything else matches the sign-only screen, including the fee the app set.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign and send"
              total={{
                amount: <ExactAmount value="1.500400" symbol="STX" />,
                fiat: '$1.22',
              }}
            />
          }
        >
          <ApprovalHeader requester={gamma} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Send 1.5 STX"
            kind={`STX transfer · built by ${displayOrigin(gamma.origin)}, sent by Leather`}
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1.500000" symbol="STX" />}
              fiat="$1.22"
            />
            <ApprovalRecipientRow
              address={<AddressDisplayer address={stxRecipient} />}
              caption="Memo: order 7731"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.000400" symbol="STX" />}
              fiat={feeUnderOneCent}
              caption="Set by app"
              action={<ApprovalRowAction label="Edit" />}
            />
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
            <ApprovalRow label="Nonce" value={<ApprovalIdentifier>41</ApprovalIdentifier>} />
            <ApprovalDisclosureRow label="All details" caption="Raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sip030-account-change',
    family: 'sip-030',
    label: 'Switching account while sites are connected',
    method: 'stx_accountChange · event, not emitted today',
    refs: ['#2708', '#2752', '#2807'],
    note: 'SIP-030 lets connected sites listen for account changes. With connect decoupled from Leather’s active account, switching in Leather no longer moves a site on its own. This sheet opens from the account switcher only when sites are connected, and each site moves, and is told, only if you turn it on. Leather’s provider has no listen method today, so sites can’t hear about switches at all.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Switch to Account 3" />}>
          <ApprovalIntent title="Switch to Account 3" kind="2 sites are connected to Account 1" />
          <ApprovalSection label="Move these sites too">
            <ApprovalSwitchRow
              icon={<RequesterIcon origin={bitflow.origin} size={32} />}
              title={<OriginName origin={bitflow.origin} />}
              caption="On Account 1"
            />
            <ApprovalSwitchRow
              icon={<RequesterIcon origin={zest.origin} size={32} />}
              title={<OriginName origin={zest.origin} />}
              caption="On Account 1"
            />
          </ApprovalSection>
          <ApprovalSection label="Account" divided>
            <Flex alignItems="center" gap="space.03" py="space.02">
              <AccountAvatar account={account3} size="md" />
              <Stack gap="0" flex="1" minWidth={0}>
                <styled.span textStyle="label.02">{account3.name}</styled.span>
                <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
                  {truncateMiddle(account3.address, 4)}
                </styled.span>
              </Stack>
            </Flex>
          </ApprovalSection>
          <ApprovalNote>
            A site you move is told about the new account right away. Sites you leave keep working
            with Account 1.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sip030-network-change',
    family: 'sip-030',
    label: 'The site asks to switch network',
    method: 'stx_networkChange · no SIP-030 request method yet',
    refs: ['#2752', '#2807'],
    note: 'Like MetaMask’s network switch, the site asks to move its connection to Testnet, for testing or after a user picks it on the site. SIP-030 has only the network-changed event and stx_getNetworks, which answers silently, so this request needs a SIP amendment or a Leather method. Only the site’s connection moves; switching Leather itself stays a separate choice, off by default, as on the Testnet connect screen. Once approved, the site is told through the network-changed event.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Switch to Testnet" />}>
          <ApprovalHeader requester={bitflow} account={account1} network={mainnet} />
          <ApprovalIntent
            title="Switch this site to Testnet"
            kind="The site is asking to use another network"
          />
          <ApprovalSection label="Network">
            <ApprovalRow label="This site now uses" value="Mainnet" />
            <ApprovalRow label="It will use" value="Testnet" caption="Test funds, no real value" />
          </ApprovalSection>
          <ApprovalSection label="Leather" divided>
            <ApprovalSwitchRow
              title="Also switch Leather to Testnet"
              caption="Leather is on Mainnet and stays there unless you choose this."
            />
          </ApprovalSection>
          <ApprovalSection label="This site will be able to" divided>
            <ApprovalPermission>See your Testnet Stacks and Bitcoin addresses</ApprovalPermission>
            <ApprovalPermission kind="cannot">
              It can’t sign on Mainnet until it asks to switch back
            </ApprovalPermission>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
