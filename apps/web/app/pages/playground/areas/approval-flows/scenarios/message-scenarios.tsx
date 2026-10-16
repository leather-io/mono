import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, BtcAvatarIcon } from '@leather.io/ui';

import { decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalPanel } from '../pattern/approval-tray';
import {
  account1,
  btcAccount1,
  btcSigner,
  btcVault,
  btcVaultAddress,
  gamma,
  leatherApp,
  mainnet,
  stackingDao,
  vaultBroadcastRule,
  vaultProposalSigned,
} from './fixtures';
import type { Scenario } from './scenario';

const proposalRecipient = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

const commitmentHash = '786871b3accff01344307e0a624a679ae0f6256b6ac479ed5a4ed91e904f857a';

const structuredHash = 'f2c3ee79cb35480a1ed5e9d307aa577300f6761aece40b3089df4ef87bb05959';

const ownershipMessage = `Welcome back. Sign this message to prove you own this address.

Purpose: list inscriptions for sale
Nonce: 8f21c0a93d4e
Issued: 2026-09-25T10:42:07Z
Expires: 2026-09-25T10:52:07Z

This request does not start a transaction and costs nothing. Your signature lets the marketplace confirm that new listings come from you.`;

const taprootMessage = `Sign to confirm you own this Taproot address before we send your airdrop.

Address: ${btcAccount1.taproot}
Nonce: 7d3a91c0e2
Issued: 2026-09-28T09:20:11Z`;

const stacksPlainMessage = `I agree to the StackingDAO community guidelines and want to post in the governance forum.

Nonce: 51f0a8e3`;

export const messageScenarios: Scenario[] = [
  {
    id: 'message-bip322',
    family: 'message',
    label: 'Sign a Bitcoin message',
    method: 'signMessage · BIP-322 · p2wpkh',
    captureId: '10-sign-message-bip322',
    refs: ['#2668', '#2587'],
    events: [
      viewed('signMessage', 'message', 'none'),
      decided('approve', '10_to_30s'),
      resulted('signed'),
    ],
    note: 'The message leads, in a fixed-height panel that scrolls on its own, so the buttons never move; the “Scroll to read all” hint only shows when the message overflows. The signing address is named by address type, instead of a truncated address tacked onto the “Requested by” sentence. The account is read-only and the network sits in the header, like every other request.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Sign" />}>
          <ApprovalHeader requester={gamma} account={btcSigner} network={mainnet} />
          <ApprovalIntent title="Sign a message" kind="Bitcoin message · BIP-322" />
          <ApprovalSection
            label="Message"
            trailing={
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                Scroll to read all
              </styled.span>
            }
          >
            <ApprovalPanel maxHeight="208px">{ownershipMessage}</ApprovalPanel>
          </ApprovalSection>
          <ApprovalSection>
            <ApprovalRow
              label="Address type"
              value="Native SegWit"
              caption={truncateMiddle(btcAccount1.nativeSegwit, 4)}
            />
          </ApprovalSection>
          <ApprovalNote>No fee, and no bitcoin moves.</ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'message-stacks-structured',
    family: 'message',
    label: 'Sign structured data (SIP-018)',
    method: 'stx_signStructuredMessage · stx_signMessage (structured)',
    captureId: '09-stx-sign-message',
    refs: ['#2668', '#2587'],
    note: 'The domain the signature is bound to comes first, in the order a Ledger shows it (chain id, name, version); the chain id is the only network fact inside the payload, so Leather names the network it stands for and checks it against the header. The message reads as one row per field, with the voter matched to your account and the raw Clarity value one tap away. Today the screen can show three network labels from three sources, the domain name reads as a heading with nothing saying the site set it, and the signing address is never named.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Sign" />}>
          <ApprovalHeader requester={stackingDao} account={account1} network={mainnet} />
          <ApprovalIntent title="Sign structured data" kind="Stacks message · SIP-018" />
          <ApprovalNote>
            No fee now. A contract can accept this signature later as your approval.
          </ApprovalNote>
          <ApprovalSection label="Domain">
            <ApprovalRow label="Chain id" value="1" caption="Mainnet · matches your network" />
            <ApprovalRow label="Name" value="StackingDAO Governance" caption="Set by the site" />
            <ApprovalRow label="Version" value="1.0.0" />
          </ApprovalSection>
          <ApprovalSection label="Message">
            <ApprovalRow label="proposal-id" value="u17" />
            <ApprovalRow label="choice" value='"for"' />
            <ApprovalRow
              label="voter"
              value="Account 1"
              caption={`${truncateMiddle(account1.address, 4)} · your address`}
            />
            <ApprovalRow label="weight" value="u1250000000" />
            <ApprovalRow label="expires-at" value="u182400" />
            <ApprovalDisclosureRow
              label="Raw message"
              caption={`Clarity value · hash ${truncateMiddle(structuredHash, 6)}`}
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'message-sign-in',
    family: 'message',
    label: 'Sign in to a Leather app',
    method: 'signMessage · stx_signMessage (Leather sign-in text)',
    refs: ['#2753', '#2690', '#2671'],
    events: [
      viewed('signMessage', 'message', 'none'),
      decided('approve', 'under_3s'),
      resulted('signed'),
    ],
    note: 'Leather already refuses sign-in text whose Domain line does not match the site asking. This screen builds on that check: it recognises the format and shows the parsed fields as rows, with a human date instead of an epoch timestamp, and it checks the Network line against the connected network, which it does not do today. The same detection could carry Sign in with Stacks once that format is settled.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Sign in" />}>
          <ApprovalHeader requester={leatherApp} account={btcSigner} network={mainnet} />
          <ApprovalIntent
            title="Sign in to app.leather.io"
            kind="Bitcoin message · Leather sign-in, recognised by Leather"
          />
          <ApprovalSection>
            <ApprovalRow label="Domain" value="app.leather.io" caption="Matches the site asking" />
            <ApprovalRow label="Application" value="Multisig" />
            <ApprovalRow label="Network" value="Mainnet" caption="Matches your network" />
            <ApprovalRow
              label="Address type"
              value="Native SegWit"
              caption={truncateMiddle(btcAccount1.nativeSegwit, 4)}
            />
            <ApprovalRow label="Issued" value="25 Sep 2026, 10:42" caption="Just now" />
          </ApprovalSection>
          <ApprovalNote icon="shield">
            Signing in doesn’t give this site access to your funds.
          </ApprovalNote>
          <ApprovalSection divided>
            <ApprovalDisclosureRow label="Raw message" caption="The exact text you sign" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'message-multisig-proposal',
    family: 'message',
    label: 'Propose a vault transaction',
    method:
      'proposed: vault propose request (PSBT + commitment) · today: signMessage over the hash',
    refs: ['#2587', '#2773'],
    note: 'Today the first popup of a proposal shows a 64-character hash under an ownership disclaimer; here Leather decodes the proposed transaction, keeps the commitment (a sha256 over tag, vault address, PSBT and timestamp) as a quiet detail, and Propose signs it and the transaction with Account 1’s key in one approval. Unlike a plain message, which Leather refuses while a vault is connected, this request names its vault, which needs the descriptor matched to a vault added in Leather. It also needs the two steps combined (today the multisig web app asks twice and other sites send the proposal unsigned) and the web app to send the PSBT and timestamp next to the hash so Leather can recompute it, an RPC change that does not exist yet.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Propose"
              reversibility="proposal"
              total={{
                label: 'Total from vault',
                amount: <ExactAmount value="0.10001050" symbol="BTC" />,
                fiat: '$10,978.95',
              }}
            />
          }
        >
          <ApprovalHeader requester={leatherApp} account={btcVault} network={mainnet} />
          <ApprovalIntent
            title={'Propose sending 0.1\u00a0BTC from Team Treasury'}
            kind="Vault proposal · decoded by Leather"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="Leaves the vault"
              qualifier="Only once approved"
              amount={<ExactAmount value="0.10000000" symbol="BTC" />}
              fiat="$10,977.80"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={proposalRecipient} />} />
            <ApprovalRow
              label="Change to the vault"
              value={<ExactAmount value="0.64998950" symbol="BTC" />}
              caption={`${truncateMiddle(btcVaultAddress, 4)} · checked by Leather`}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00001050" symbol="BTC" />}
              fiat="$1.15"
              caption="Set by app · 5 sat/vB · paid by the vault"
            />
            <ApprovalGuarantee kind="final">
              Signatures on this transaction cover every input and output. If anything changes, they
              no longer count.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalNote>
            {vaultProposalSigned} {vaultBroadcastRule}
          </ApprovalNote>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Commitment, inputs and outputs, raw PSBT"
          >
            <ApprovalRow
              label="Commitment"
              value={<ApprovalIdentifier>{truncateMiddle(commitmentHash, 6)}</ApprovalIdentifier>}
              caption={['Signed with the transaction', 'Recomputed by Leather from these details']}
            />
            <ApprovalDisclosureRow label="All details" caption="Inputs and outputs, raw PSBT" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'message-bip322-taproot',
    family: 'message',
    label: 'Sign a Bitcoin message with Taproot',
    method: 'signMessage · BIP-322 · p2tr',
    refs: ['#2668', '#2587'],
    events: [
      viewed('signMessage', 'message', 'none'),
      decided('approve', '10_to_30s'),
      resulted('signed'),
    ],
    note: 'The same message screen with the two facts a verifier needs as rows: the format, BIP-322, and the address type, Taproot, with the address. Sites can also ask for the older format (type legacy), the Bitcoin Signed Message style that uses ECDSA keys; it works for Native SegWit but can’t sign for a Taproot address, whose keys use a different signature scheme. So legacy plus Taproot would be refused before this screen with an error the site can act on, and legacy plus Native SegWit would say “Legacy” in the format row. Today Leather ignores the type parameter and always signs BIP-322, so a site that asked for legacy gets a signature it may not be able to check.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Sign" />}>
          <ApprovalHeader requester={gamma} account={btcSigner} network={mainnet} />
          <ApprovalIntent title="Sign a message" kind="Bitcoin message · BIP-322 · Taproot" />
          <ApprovalSection label="Message">
            <ApprovalPanel maxHeight="176px">{taprootMessage}</ApprovalPanel>
          </ApprovalSection>
          <ApprovalSection>
            <ApprovalRow label="Format" value="BIP-322" caption="For SegWit and Taproot" />
            <ApprovalRow
              label="Address type"
              value="Taproot"
              caption={truncateMiddle(btcAccount1.taproot, 4)}
            />
          </ApprovalSection>
          <ApprovalNote>No fee, and no bitcoin moves.</ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'message-stacks-plain',
    family: 'message',
    label: 'Sign a plain Stacks message',
    method: 'stx_signMessage · utf8',
    refs: ['#2668', '#2587'],
    events: [
      viewed('stx_signMessage', 'message', 'none'),
      decided('approve', '10_to_30s'),
      resulted('signed'),
    ],
    note: 'A plain text message that isn’t a sign-in. Leather looks for the sign-in format first; when it doesn’t find one, the screen says so in one quiet line, because nothing in the text was checked against the site, and the message leads in the same scrolling panel as a Bitcoin message. The signing key is named as the account’s Stacks key, since the site gets back the public key with the signature. Today the screen shows the message and the account, but not which key signs or that it isn’t a sign-in.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Sign" />}>
          <ApprovalHeader requester={stackingDao} account={account1} network={mainnet} />
          <ApprovalIntent title="Sign a message" kind="Stacks message · plain text" />
          <ApprovalSection label="Message">
            <ApprovalPanel maxHeight="176px">{stacksPlainMessage}</ApprovalPanel>
          </ApprovalSection>
          <ApprovalSection>
            <ApprovalRow
              label="Signed with"
              value="Account 1’s Stacks key"
              caption={`${truncateMiddle(account1.address, 4)} · the site gets the public key`}
            />
          </ApprovalSection>
          <ApprovalNote>
            Not a sign-in, so Leather didn’t check any of this text. No fee, and nothing moves.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
];
