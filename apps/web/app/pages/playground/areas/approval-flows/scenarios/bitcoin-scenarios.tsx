import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, Badge, BtcAvatarIcon, LockIcon } from '@leather.io/ui';

import { cautionShown, decided, detailsOpened, resulted, viewed } from '../approval-flows.events';
import { HandshakeLabelRow, HandshakeValueRow } from '../directions/handshake-primitives';
import { useApprovalDirection } from '../pattern/approval-direction';
import { ApprovalFooter } from '../pattern/approval-footer';
import { truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { AccountAvatar } from '../pattern/approval-identity';
import {
  ApprovalCaution,
  ApprovalCheck,
  ApprovalGuarantee,
  ApprovalNote,
} from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalCopyAction,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import { ApprovalPanel, ApprovalTray } from '../pattern/approval-tray';
import type { ApprovalAccount, ApprovalRequester } from '../pattern/approval-types';
import { MarketplacePsbtHistory, SegwitSendHistory } from './activity-histories';
import { bitcoinPsbtExtraScenarios, bitcoinSendExtraScenarios } from './bitcoin-extra-scenarios';
import { PsbtLegRow, depositAddress } from './bitcoin-parts';
import {
  btcAccount1,
  btcSigner,
  btcVault,
  btcVaultAddress,
  gamma,
  leatherApp,
  mainnet,
  sbtcBridge,
  vaultBroadcastRule,
  vaultMember2,
  vaultMember3,
  vaultProposalSigned,
  vaultRequiredSignatures,
  vaultYou,
} from './fixtures';
import type { Scenario } from './scenario';

const vaultRecipient = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

const taprootSpendSigner: ApprovalAccount = {
  ...btcSigner,
  balance: { amount: '0.00467120', symbol: 'BTC', fiat: '$512.79' },
};

const bondApp: ApprovalRequester = {
  origin: 'https://bonds.example',
  connection: 'connected',
};

const bondUnlockBlock = '978,900';

const bondAnnounceBlock = 'Stacks block 3,412,870';

const bondCommitmentHash = '3f9a0c27d85e41b6a9c3e07f152db84c6e9f1a3057c2d8e4b61f0a9d73e2c548';

const marketplaceAddresses = {
  seller: 'bc1p8k4v2ctlzuhr3tqrx6ax5f8dd5nxk5g6q2yv7d9mmkfa3jh0eqsq9w8kq2',
  sellerPayout: 'bc1qm8hjv0wgdx4fqsk7r5t2hluyyf6c3pfz49xk4',
  marketplaceFee: 'bc1qn4v5fwe7ar3hzlk0y2qd6s8tjxm9ca0h2fw',
};

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const base64BytesPerChar = 3 / 4;

function mockBase64(length: number) {
  return Array.from({ length }, (_, index) =>
    base64Alphabet.charAt((index * 29 + ((index * index) % 13) * 7) % base64Alphabet.length)
  ).join('');
}

const mockPsbtBodyLength = 1351;

const rawPsbt = `cHNidP8BA${mockBase64(mockPsbtBodyLength)}`;

const rawPsbtBytes = Math.floor(rawPsbt.length * base64BytesPerChar);

interface SourceRowProps {
  type: string;
  address: string;
  amount: string;
  warning?: string;
}

function SourceRow({ type, address, amount, warning }: SourceRowProps) {
  const isHandshake = useApprovalDirection()?.id === 'handshake';
  if (isHandshake) {
    return (
      <Stack gap="space.02" py="space.02" minWidth={0}>
        <HandshakeLabelRow label={type} />
        <HandshakeValueRow icon={<BtcAvatarIcon size="md" />}>
          <Stack gap="0" minWidth={0}>
            <styled.span textStyle="label.02">
              <ExactAmount value={amount} symbol="BTC" />
            </styled.span>
            <styled.span textStyle="code" color="ink.text-subdued" title={address}>
              {truncateMiddle(address)}
            </styled.span>
            {warning && (
              <styled.span textStyle="caption.01" color="red.action-primary-default">
                {warning}
              </styled.span>
            )}
          </Stack>
        </HandshakeValueRow>
      </Stack>
    );
  }
  return (
    <Flex justifyContent="space-between" alignItems="flex-start" gap="space.03" py="space.02">
      <Stack gap="0" minWidth={0}>
        <styled.span textStyle="label.03">{type}</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {truncateMiddle(address, 4)}
        </styled.span>
        {warning && (
          <styled.span textStyle="caption.01" color="red.action-primary-default">
            {warning}
          </styled.span>
        )}
      </Stack>
      <styled.span textStyle="label.03" flexShrink={0}>
        <ExactAmount value={amount} symbol="BTC" />
      </styled.span>
    </Flex>
  );
}

function MarketplaceDetailsTray() {
  return (
    <ApprovalTray title="Inputs and outputs" maxHeight="73%">
      <ApprovalSection label="Inputs · you sign 4 of 5, each covering everything">
        <PsbtLegRow index={0} tag="yours" address={btcAccount1.nativeSegwit} amount="0.00000600" />
        <PsbtLegRow index={1} tag="yours" address={btcAccount1.nativeSegwit} amount="0.00000600" />
        <PsbtLegRow
          index={2}
          tag="external"
          address={marketplaceAddresses.seller}
          amount="0.00010000"
          caption="Signed by its owner · locks output #2 only"
        />
        <PsbtLegRow index={3} tag="yours" address={btcAccount1.nativeSegwit} amount="0.01800000" />
        <PsbtLegRow index={4} tag="yours" address={btcAccount1.nativeSegwit} amount="0.00500000" />
      </ApprovalSection>
      <ApprovalSection label="Outputs" divided>
        <PsbtLegRow
          index={0}
          tag="change"
          address={btcAccount1.nativeSegwit}
          amount="0.00001200"
          caption="Padding back from inputs #0 and #1"
        />
        <PsbtLegRow
          index={1}
          tag="yours"
          address={btcAccount1.taproot}
          amount="0.00010000"
          caption="Taproot"
        />
        <PsbtLegRow
          index={2}
          tag="external"
          address={marketplaceAddresses.sellerPayout}
          amount="0.02000000"
          caption="Locked by input #2"
        />
        <PsbtLegRow
          index={3}
          tag="external"
          address={marketplaceAddresses.marketplaceFee}
          amount="0.00100000"
        />
        <PsbtLegRow
          index={4}
          tag="data"
          address="OP_RETURN"
          amount="0.00000000"
          caption="Data only, no bitcoin · 6a0c…6f72"
        />
        <PsbtLegRow
          index={5}
          tag="change"
          address={btcAccount1.nativeSegwit}
          amount="0.00190000"
          caption="Native SegWit change"
        />
      </ApprovalSection>
      <ApprovalSection divided>
        <ApprovalRow
          label="Fee · inputs minus outputs"
          value={<ExactAmount value="0.00010000" symbol="BTC" />}
          caption="19 sat/vB · locked, set by gamma.io"
        />
      </ApprovalSection>
      <ApprovalSection
        label="Raw PSBT"
        trailing={
          <ApprovalCopyAction caption={`base64 · ${rawPsbtBytes.toLocaleString('en-US')} bytes`} />
        }
        divided
      >
        <ApprovalPanel mono maxHeight="68px">
          {rawPsbt}
        </ApprovalPanel>
      </ApprovalSection>
    </ApprovalTray>
  );
}

interface MarketplacePsbtProps {
  overlay?: ReactNode;
}

function MarketplacePsbt({ overlay }: MarketplacePsbtProps) {
  return (
    <ApprovalShell
      overlay={overlay}
      footer={
        <ApprovalFooter
          primaryLabel="Sign"
          total={{ amount: <ExactAmount value="0.02110000" symbol="BTC" />, fiat: '$2,316.32' }}
        />
      }
    >
      <ApprovalHeader requester={gamma} account={btcSigner} network={mainnet} />
      <ApprovalIntent
        title="Sign a spend of 0.0211 BTC"
        kind="PSBT · you sign 4 of 5 inputs · built by gamma.io"
      />
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You send"
          qualifier={`Native SegWit · ${truncateMiddle(btcAccount1.nativeSegwit, 4)}`}
          amount={<ExactAmount value="0.02110000" symbol="BTC" />}
          fiat="$2,316.32"
        />
        <ApprovalAssetRow
          icon={<BtcAvatarIcon size="md" />}
          label="You receive"
          qualifier={`Taproot · ${truncateMiddle(btcAccount1.taproot, 4)}`}
          amount={<ExactAmount value="0.00010000" symbol="BTC" />}
          fiat="$10.98"
          direction="in"
        />
        <ApprovalFeeRow
          amount={<ExactAmount value="0.00010000" symbol="BTC" />}
          fiat="$10.98"
          icon={<LockIcon variant="small" color="ink.text-subdued" />}
          caption={[
            'Locked · 19 sat/vB · part of You send',
            'Leather signs the trade as gamma.io built it',
          ]}
        />
        <ApprovalGuarantee kind="final">
          Your signature covers every input and output. If anything changes, it no longer counts.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalNote>
        Leather signs your 4 inputs and returns the transaction to gamma.io, which decides whether
        and when to broadcast it. One input is already signed by its owner. Leather reads bitcoin
        amounts only, not inscriptions.
      </ApprovalNote>
      <ApprovalSection label="Details" divided collapsible summary="Inputs and outputs, raw PSBT">
        <ApprovalDisclosureRow label="Inputs and outputs" caption="5 in, 6 out, raw PSBT" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const bitcoinScenarios: Scenario[] = [
  {
    id: 'send-transfer-taproot',
    family: 'bitcoin',
    label: 'Send BTC that reaches into Taproot coins',
    method: 'sendTransfer',
    captureId: '07-send-transfer',
    refs: ['#2738'],
    events: [
      viewed('sendTransfer', 'bitcoin_send', 'caution'),
      cautionShown('coin_selection'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'The caution appears only when Taproot coins are actually spent, before Approve instead of today’s sheet after it. It is one short sentence with Edit sources as its only action, and it always shows, because each send that reaches into Taproot carries the risk again. The sources are listed under the amount. Like the Native SegWit case, it needs Leather to build the transaction once, before this screen, so the sources and fee shown are the ones signed.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{ amount: <ExactAmount value="0.00443120" symbol="BTC" />, fiat: '$486.45' }}
            />
          }
        >
          <ApprovalHeader requester={sbtcBridge} account={taprootSpendSigner} network={mainnet} />
          <ApprovalIntent title="Send 0.00442 BTC" kind="Bitcoin transfer · built by Leather" />
          <ApprovalCaution title="Some coins come from Taproot">
            Coins held there may carry inscriptions or runes. Spending them destroys those assets.
            <styled.span display="flex" mt="space.03">
              <ApprovalRowAction label="Edit sources" />
            </styled.span>
          </ApprovalCaution>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="0.00442000" symbol="BTC" />}
              fiat="$485.22"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={depositAddress} />} />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00001120" symbol="BTC" />}
              fiat="$1.23"
              speed="standard"
              caption="5 sat/vB · about 30 min"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="final">
              Your signature covers every input and output. If anything changes, it no longer
              counts.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection
            label="Paying from"
            trailing={<ApprovalRowAction label="Edit sources" />}
            divided
          >
            <SourceRow
              type="Native SegWit"
              address={btcAccount1.nativeSegwit}
              amount="0.00412000"
            />
            <SourceRow
              type="Taproot"
              address={btcAccount1.taproot}
              amount="0.00031120"
              warning="May hold inscriptions or runes"
            />
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Inputs and outputs, raw transaction"
          >
            <ApprovalDisclosureRow
              label="All details"
              caption="Inputs and outputs, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'send-transfer-segwit-only',
    family: 'bitcoin',
    label: 'Send BTC from Native SegWit only',
    method: 'sendTransfer',
    refs: ['#2738'],
    note: 'The same send when every coin comes from Native SegWit: no caution appears, and Spending from folds into one quiet row with Edit sources, so the address that pays is still named. Today the screen shows one address next to a combined balance and never says which coins are spent. It needs Leather to build the transaction once, before this screen, so the source and fee shown are the ones signed; today coin selection runs again when you press Approve.',
    history() {
      return <SegwitSendHistory />;
    },
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{ amount: <ExactAmount value="0.00300765" symbol="BTC" />, fiat: '$330.17' }}
            />
          }
        >
          <ApprovalHeader requester={sbtcBridge} account={btcSigner} network={mainnet} />
          <ApprovalIntent title="Send 0.003 BTC" kind="Bitcoin transfer · built by Leather" />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="0.00300000" symbol="BTC" />}
              fiat="$329.33"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={depositAddress} />} />
            <ApprovalRow
              label="Paying from"
              value="Native SegWit"
              caption={`${truncateMiddle(btcAccount1.nativeSegwit, 4)} · change returns here`}
              action={<ApprovalRowAction label="Edit sources" />}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00000765" symbol="BTC" />}
              fiat="$0.84"
              speed="standard"
              caption="5 sat/vB · about 30 min"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="final">
              Your signature covers every input and output. If anything changes, it no longer
              counts.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Inputs and outputs, raw transaction"
          >
            <ApprovalDisclosureRow
              label="All details"
              caption="Inputs and outputs, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'send-transfer-sign-only',
    family: 'bitcoin',
    label: 'Sign BTC for the app to broadcast',
    method: 'sendTransfer · broadcast: false',
    refs: ['#2719'],
    note: 'An sBTC deposit where the app asks Leather to sign but not broadcast. The title starts with Sign, a quiet note says the app decides whether and when it goes out, the guarantee says it can only go out as signed, and the button says Sign. Today this is a warning callout that names the full origin twice, which makes an expected step read like a risk. Bridge BTC to sBTC, under Staking and sBTC, shows the same deposit read as a bridge, with the Stacks account it mints to.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              reversibility="signed-copy"
              total={{
                amount: <ExactAmount value="0.01000765" symbol="BTC" />,
                fiat: '$1,098.62',
              }}
            />
          }
        >
          <ApprovalHeader requester={sbtcBridge} account={btcSigner} network={mainnet} />
          <ApprovalIntent
            title="Sign a transfer of 0.01 BTC"
            kind="Bitcoin transfer · built by Leather, for the app to broadcast"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="0.01000000" symbol="BTC" />}
              fiat="$1,097.78"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={depositAddress} />} />
            <ApprovalRow
              label="Paying from"
              value="Native SegWit"
              caption={`${truncateMiddle(btcAccount1.nativeSegwit, 4)} · change returns here`}
              action={<ApprovalRowAction label="Edit sources" />}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00000765" symbol="BTC" />}
              fiat="$0.84"
              speed="standard"
              caption="5 sat/vB · about 30 min"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="final">
              Your signature covers every input and output. If anything changes, it no longer
              counts.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalNote>
            Leather signs and returns it to sbtc.stacks.co, which decides whether and when to
            broadcast it.
          </ApprovalNote>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Inputs and outputs, raw transaction"
          >
            <ApprovalDisclosureRow
              label="All details"
              caption="Inputs and outputs, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  ...bitcoinSendExtraScenarios,
  {
    id: 'sign-psbt-marketplace',
    family: 'bitcoin',
    label: 'Sign a marketplace PSBT',
    method: 'signPsbt · your inputs SIGHASH_ALL · seller input already signed SINGLE|ANYONECANPAY',
    refs: ['#2587', '#2738'],
    events: [
      viewed('signPsbt', 'psbt', 'note'),
      detailsOpened('all_details'),
      decided('approve', '30_to_120s'),
      resulted('signed'),
    ],
    note: 'Leather only signs here, so the title starts with Sign and a quiet note says gamma.io decides whether and when to broadcast. The headline and What moves come from the net effect on your own addresses, with the fee read from the transaction and counted once, and the seller’s input, already signed with SINGLE|ANYONECANPAY, is spelled out in the tray. The fee row is locked rather than editable: Leather signs the trade exactly as gamma.io built it and changes fees only on transactions it builds itself. Today the title is “Approve transaction”, the fee sits inside “You’ll transfer”, and outputs without an address are hidden.',
    history() {
      return <MarketplacePsbtHistory />;
    },
    render() {
      return <MarketplacePsbt />;
    },
  },
  {
    id: 'sign-psbt-cosign-vault',
    family: 'bitcoin',
    label: 'Co-sign a Bitcoin vault spend',
    method: 'signPsbt · descriptor, vault co-sign',
    refs: ['#2587', '#2672'],
    note: 'A co-signer approving a vault spend proposed in Leather Multisig. The vault and the signing account share the header with no switcher, Leather confirms before Sign that Account 1 holds a key in this vault, and the signature count comes from the PSBT, which needs app.leather.io to send it with the signatures collected so far. The fee is locked because the signature already collected covers it, and changing it would void that signature. The Signers block shows each member’s device and status against the threshold, with Decline proposal as a quiet action there: it is recorded for every signer, while Cancel only closes this window. Today the screen calls it a “contract transaction”, offers a switcher, and only reports a non-signer after Confirm; naming the vault needs the descriptor matched to a vault added in Leather, and the member names and statuses need Leather Multisig to send them with the PSBT.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              total={{
                label: 'Total from vault',
                amount: <ExactAmount value="0.25001260" symbol="BTC" />,
                fiat: '$27,445.88',
              }}
            />
          }
        >
          <ApprovalHeader requester={leatherApp} account={btcVault} network={mainnet} />
          <ApprovalIntent
            title={'Sign a transfer of 0.25\u00a0BTC from Team Treasury'}
            kind="Bitcoin vault transfer · you are co-signing"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="Leaves the vault"
              qualifier="Exactly"
              amount={<ExactAmount value="0.25000000" symbol="BTC" />}
              fiat="$27,444.50"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={vaultRecipient} />} />
            <ApprovalRow
              label="Change to the vault"
              value={<ExactAmount value="0.74998740" symbol="BTC" />}
              caption={`${truncateMiddle(btcVaultAddress, 4)} · checked by Leather`}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00001260" symbol="BTC" />}
              fiat="$1.38"
              icon={<LockIcon variant="small" color="ink.text-subdued" />}
              caption={[
                'Locked · 7 sat/vB · paid by the vault',
                'Changing it would void the other signature',
              ]}
            />
            <ApprovalGuarantee kind="final">
              Your signature covers every input and output. If anything changes, it no longer
              counts.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Signers" divided>
            <ApprovalCheck
              title="Account 1 is a signer on this vault"
              caption="Its key is in the vault’s descriptor"
            />
            <ApprovalSigners
              required={vaultRequiredSignatures}
              signers={[
                { ...vaultMember2, status: 'signed', detail: 'proposed it' },
                { ...vaultYou, status: 'signing' },
                { ...vaultMember3, status: 'waiting' },
              ]}
              caption="Yours makes 2 of 2, then app.leather.io can broadcast it."
              declineLabel="Decline proposal"
              declineCaption="Recorded for every signer"
            />
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Inputs and outputs, descriptor, raw PSBT"
          >
            <ApprovalDisclosureRow
              label="All details"
              caption="Inputs and outputs, descriptor, raw PSBT"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sign-psbt-bond-exit',
    family: 'bitcoin',
    label: 'Propose an early bond exit',
    method: 'signPsbt · bond descriptor, vault pinned',
    refs: ['#2648', '#2587'],
    note: 'A vault proposes leaving a bond before it unlocks: the two spending paths read as plain rows with this exit’s marked, and the note and Commitment row say Propose signs the commitment and Account 1’s signature on the exit in one approval. That depends on combining the two steps: today the multisig web app asks twice and other sites send the proposal unsigned. Leaving early starts on Stacks (Announce an early bond exit, under Staking and sBTC), and the exit co-signer signs only after it sees that announcement, so the screen checks it is there before Propose. The value the exit reveals is worked out from the vault’s Stacks address, so there is nothing secret to keep, and it moves to the bond details. Today’s callout says nothing is signed, which is not quite true, and shows the counterparty key and secret hash inline as hex.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Propose"
              total={{
                label: 'Total from bond',
                amount: <ExactAmount value="0.50000000" symbol="BTC" />,
                fiat: '$54,889.00',
              }}
            />
          }
        >
          <ApprovalHeader requester={bondApp} account={btcVault} network={mainnet} />
          <ApprovalIntent
            title="Propose a 0.5 BTC early bond exit"
            kind="Vault proposal · co-signers approve later"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="Leaves the bond"
              qualifier="Only once approved"
              amount={<ExactAmount value="0.50000000" symbol="BTC" />}
              fiat="$54,889.00"
            />
            <ApprovalRecipientRow
              address="Team Treasury"
              avatar={<AccountAvatar account={btcVault} size="md" />}
              caption={[
                <>
                  Receives <ExactAmount value="0.49997800" symbol="BTC" />
                </>,
                `${truncateMiddle(btcVaultAddress, 4)} · checked by Leather`,
              ]}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00002200" symbol="BTC" />}
              fiat="$2.42"
              icon={<LockIcon variant="small" color="ink.text-subdued" />}
              caption={[
                'Locked · 10 sat/vB · paid from the bond',
                'Changing it would void the exit co-signer’s signature',
              ]}
            />
            <ApprovalGuarantee kind="final">
              Signatures on this exit cover every input and output. If anything changes, they no
              longer count.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalNote>
            {vaultProposalSigned} {vaultBroadcastRule} The exit co-signer has already signed.
          </ApprovalNote>
          <ApprovalSection label="Spending conditions" divided>
            <ApprovalCheck
              title="Early exit announced on Stacks"
              caption={`${bondAnnounceBlock} · by Team Treasury’s Stacks address`}
            />
            <ApprovalRow
              stacked
              label={`Before block ${bondUnlockBlock} · early exit`}
              action={<Badge label="This proposal" variant="info" />}
              value="2 of 3 co-signers, plus the bond’s exit co-signer"
              caption="Only after the exit is announced on Stacks"
            />
            <ApprovalRow
              stacked
              label={`From block ${bondUnlockBlock} · in about 3 months`}
              value="2 of 3 co-signers"
            />
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Commitment, descriptor, raw PSBT"
          >
            <ApprovalRow
              label="Commitment"
              value={
                <ApprovalIdentifier>{truncateMiddle(bondCommitmentHash, 6)}</ApprovalIdentifier>
              }
              caption={['Signed with the exit', 'Recomputed by Leather from these details']}
            />
            <ApprovalDisclosureRow
              label="Bond details"
              caption="Descriptor, exit co-signer key, exit script, raw PSBT"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'sign-psbt-details-tray',
    family: 'bitcoin',
    label: 'Marketplace PSBT, details open',
    method: 'signPsbt · details tray',
    refs: ['#2587'],
    note: 'The details tray over the marketplace request. Inputs and outputs are listed in index order and tagged Yours, Change, External and Data, each with its amount, so the seller input and the output it locks line up at #2; the fee sits on its own line as inputs minus outputs, and the raw PSBT underneath has its size and a copy action. Today outputs without an address are left out of this list, although they still count toward the fee.',
    render() {
      return <MarketplacePsbt overlay={<MarketplaceDetailsTray />} />;
    },
  },
  ...bitcoinPsbtExtraScenarios,
];
