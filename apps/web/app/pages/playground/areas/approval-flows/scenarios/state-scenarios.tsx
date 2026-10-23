import { useEffect, useState } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  BtcAvatarIcon,
  SbtcAvatarIcon,
  SkeletonLoader,
  StxAvatarIcon,
} from '@leather.io/ui';

import { cautionShown, decided, detailsOpened, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { displayOrigin, noFiatPrice, truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalCaution, ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
import { useApprovalOptions } from '../pattern/approval-options';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
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
import { ApprovalPanel } from '../pattern/approval-tray';
import type { ApprovalAccount } from '../pattern/approval-types';
import { depositAddress } from './bitcoin-parts';
import {
  account1,
  account1Stx,
  bitflow,
  btcAccount1,
  btcSigner,
  contracts,
  embeddedApp,
  explorer,
  feeUnderOneCent,
  gamma,
  leatherApp,
  localDapp,
  mainnet,
  sbtcBridge,
  stxRecipient,
} from './fixtures';
import type { Scenario } from './scenario';

const emptyAccount1: ApprovalAccount = {
  ...account1,
  balance: { amount: '0.000000', symbol: 'STX', fiat: '$0.00' },
};

const unpricedAccount1: ApprovalAccount = {
  ...account1,
  balance: { amount: '1,402,118.550000', symbol: 'STX' },
};

const refreshDelayMs = 2400;

const undecodableTransaction =
  '00000000010400a46ff88886c2ef9762d970b4d2c63678835bd39d000000000000002a0000000000000bb8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000302000000010216a6a37f2c9e04ffffff0d1ce37b90a2';

const undecodableTransactionBytes = undecodableTransaction.length / 2;

function SkeletonAssetRow() {
  return (
    <Flex alignItems="center" gap="space.03" py="space.02" minHeight="48px">
      <SkeletonLoader isLoading width="32px" height="32px" borderRadius="round" flexShrink={0} />
      <Stack gap="space.02" flex="1">
        <SkeletonLoader isLoading width="72px" height="14px" />
        <SkeletonLoader isLoading width="96px" height="12px" />
      </Stack>
      <Stack gap="space.02" alignItems="flex-end">
        <SkeletonLoader isLoading width="120px" height="14px" />
        <SkeletonLoader isLoading width="56px" height="12px" />
      </Stack>
    </Flex>
  );
}

function SkeletonDetailRow() {
  return (
    <Flex justifyContent="space-between" alignItems="center" gap="space.04" minHeight="36px">
      <SkeletonLoader isLoading width="80px" height="12px" />
      <SkeletonLoader isLoading width="112px" height="14px" />
    </Flex>
  );
}

function SkeletonIntent() {
  return (
    <Stack gap="space.03" px="space.05" pt="space.05" pb="space.04" aria-hidden="true">
      <SkeletonLoader isLoading width="248px" height="28px" />
      <SkeletonLoader isLoading width="200px" height="12px" />
    </Stack>
  );
}

interface RefreshedFacts {
  fiat: string;
  fee: string;
  total: string;
}

const factsWhenOpened: RefreshedFacts = {
  fiat: '$812.40',
  fee: '0.003000',
  total: '1,000.003000',
};

const factsAfterRecheck: RefreshedFacts = {
  fiat: '$803.60',
  fee: '0.004500',
  total: '1,000.004500',
};

function useRecheckedFacts() {
  const { isSolo } = useApprovalOptions();
  const [isRechecked, setIsRechecked] = useState(!isSolo);
  useEffect(() => {
    if (isRechecked) return undefined;
    const timeout = window.setTimeout(() => setIsRechecked(true), refreshDelayMs);
    return () => window.clearTimeout(timeout);
  }, [isRechecked]);
  return isRechecked;
}

function RefreshedScreen() {
  const isRechecked = useRecheckedFacts();
  const facts = isRechecked ? factsAfterRecheck : factsWhenOpened;
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Send"
          reversibility="once-confirmed"
          total={{
            amount: <ExactAmount value={facts.total} symbol="STX" />,
            fiat: facts.fiat,
            priced: isRechecked ? 'Priced just now' : undefined,
          }}
        />
      }
    >
      <ApprovalHeader requester={explorer} account={account1Stx} network={mainnet} />
      <ApprovalIntent title="Send 1,000 STX" kind="STX transfer · built by Leather" />
      {isRechecked && (
        <ApprovalNote>
          Leather checked again after a minute. The price and the fee changed, so both are marked
          and Send waits a moment before it works.
        </ApprovalNote>
      )}
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly"
          amount={<ExactAmount value="1,000.000000" symbol="STX" />}
          fiat={facts.fiat}
          updated={isRechecked ? `Was ${factsWhenOpened.fiat}` : undefined}
        />
        <ApprovalRecipientRow address={<AddressDisplayer address={stxRecipient} />} />
        <ApprovalFeeRow
          amount={<ExactAmount value={facts.fee} symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
          action={<ApprovalRowAction label="Edit" />}
          updated={
            isRechecked ? (
              <>
                Was <ExactAmount value={factsWhenOpened.fee} symbol="STX" />
              </>
            ) : undefined
          }
        />
        <ApprovalGuarantee kind="strict">
          Only this amount and the fee can leave your account. Anything else makes the transfer
          fail.
        </ApprovalGuarantee>
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
        <ApprovalDisclosureRow label="All details" caption="Nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const stateScenarios: Scenario[] = [
  {
    id: 'state-loading',
    family: 'state',
    label: 'Loading',
    method: 'stx_callContract · while fee, balance and contract load',
    refs: ['#2587'],
    events: [decided('window_closed', '10_to_30s')],
    note: 'Never a blank popup: the header and footer come from the request and the connection, and the body holds the shape of the final screen until every fact is in. Cancel works from the first frame, and the primary stays disabled until then. Today every loader renders nothing until its data arrives, and a failed query leaves the popup blank.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              isPrimaryDisabled
              total={{
                amount: <SkeletonLoader isLoading width="120px" height="14px" />,
              }}
              hint={
                <styled.p textStyle="caption.01" color="ink.text-subdued" aria-live="polite">
                  Checking the contract, fee and balance
                </styled.p>
              }
            />
          }
        >
          <ApprovalHeader requester={bitflow} account={account1} network={mainnet} />
          <SkeletonIntent />
          <ApprovalSection label="What moves">
            <SkeletonAssetRow />
            <SkeletonAssetRow />
          </ApprovalSection>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary={<SkeletonLoader isLoading width="88px" height="12px" />}
          >
            <SkeletonDetailRow />
            <SkeletonDetailRow />
            <SkeletonDetailRow />
            <SkeletonDetailRow />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'state-insufficient',
    family: 'state',
    label: 'Balance does not cover amount and fee',
    method: 'stx_signTransaction · sign only, STX transfer payload',
    captureId: '04-stx-sign-transaction',
    refs: ['#2587', '#2624'],
    events: [
      viewed('stx_signTransaction', 'sign_transaction', 'blocking'),
      decided('cancel', '3_to_10s'),
    ],
    note: 'A sign-only transfer the balance cannot cover: the title starts with Sign as on every sign-only request, and the footer says why in the asset being spent, with both numbers, and Cancel stays. Today the check compares micro-STX with US cents, and when it fires both buttons disappear, so closing the window is the only way out. The fee here is the one the site put in the transaction, labelled as such.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              total={{
                amount: <ExactAmount value="1,234,999.000400" symbol="STX" />,
                fiat: '$1,003,313.19',
              }}
              blockedReason={
                <>
                  You have <ExactAmount value="0.000000" symbol="STX" />. This needs{' '}
                  <ExactAmount value="1,234,999.000400" symbol="STX" />.
                </>
              }
            />
          }
        >
          <ApprovalHeader requester={localDapp} account={emptyAccount1} network={mainnet} />
          <ApprovalIntent
            title="Sign a transfer of 1,234,999 STX"
            kind={`STX transfer · built by ${displayOrigin(localDapp.origin)}`}
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1,234,999.000000" symbol="STX" />}
              fiat="$1,003,313.19"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={stxRecipient} />} />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.000400" symbol="STX" />}
              fiat={feeUnderOneCent}
              caption={[
                'Set by app',
                <>
                  Leather suggests <ExactAmount value="0.002100" symbol="STX" />
                </>,
              ]}
              action={<ApprovalRowAction label="Edit" />}
            />
          </ApprovalSection>
          <ApprovalNote>
            Leather signs and returns it to {displayOrigin(localDapp.origin)}, which decides whether
            and when to broadcast it.
          </ApprovalNote>
          <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
            <ApprovalRow label="Nonce" value="41" caption="Set by app" />
            <ApprovalDisclosureRow label="All details" caption="Raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'state-cant-decode',
    family: 'state',
    label: 'Leather could not read the transaction',
    method: 'stx_signTransaction · payload fails to decode',
    refs: ['#2587'],
    events: [
      viewed('stx_signTransaction', 'sign_transaction', 'blocking'),
      cautionShown('decoder', 'blocking'),
      decided('cancel', '10_to_30s'),
    ],
    note: 'A parse failure lands here, never on a clean-looking review and never on the crash page. The bytes are shown exactly as the site sent them so they can be reported, and there is nothing to approve. Today the decoder throws into the error boundary, signPsbt shows a bare Failed request page, and in both the site only hears a rejection when the window closes; sending it an error straight away needs an agreed RPC error code.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign"
              blockedReason="Leather can’t sign what it can’t read."
            />
          }
        >
          <ApprovalHeader requester={gamma} account={account1} network={mainnet} />
          <ApprovalIntent
            title="Leather couldn’t read this transaction"
            kind={`Transaction signing · built by ${displayOrigin(gamma.origin)}`}
          />
          <ApprovalCaution
            tone="blocking"
            title="Nothing here can be checked"
            source="Leather’s transaction decoder"
          >
            These bytes don’t decode as a Stacks transaction, so Leather can’t show what they would
            move or authorise.
          </ApprovalCaution>
          <ApprovalSection
            label="What the site sent"
            trailing={<ApprovalCopyAction caption={`${undecodableTransactionBytes} bytes`} />}
          >
            <ApprovalPanel mono maxHeight="200px">
              {undecodableTransaction}
            </ApprovalPanel>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'state-embedded',
    family: 'state',
    label: 'Request from a site embedded in another',
    method: 'stx_callContract · from a cross-origin frame',
    refs: ['#2737'],
    events: [
      viewed('stx_callContract', 'contract_call', 'caution', true),
      cautionShown('frame_check'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'The header names the frame that is asking and the page it sits in, and one caution says the same in words, naming both sites. The caution should rest on a real frame check: a prerendered page, the likely cause of the false warning in #2737, is not embedded, so a missing tab origin alone should not be read as a mismatch. The title assumes Velar is on the proposed Leather-owned list of known contracts.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              total={{
                amount: <ExactAmount value="250.003000" symbol="STX" />,
                fiat: '$203.10',
              }}
            />
          }
        >
          <ApprovalHeader requester={embeddedApp} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Swap 250 STX for sBTC"
            kind="Contract call · Velar swap, recognised by Leather"
          />
          <ApprovalCaution
            title="Asked by app.velar.com, not stx.asigna.io"
            source="Leather’s frame check"
          >
            app.velar.com runs inside a frame on stx.asigna.io. Only continue if you trust
            app.velar.com.
          </ApprovalCaution>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="250.000000" symbol="STX" />}
              fiat="$203.10"
            />
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You receive"
              qualifier="At least"
              amount={<ExactAmount value="0.00182000" symbol="sBTC" />}
              fiat="$199.80"
              direction="in"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Every movement is listed here, including the minimum the contract sends you. If
              anything else moves, the transaction fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
            <ApprovalContractRow label="Contract" contractId={contracts.velarRouter} />
            <ApprovalRow
              label="Function"
              value={<ApprovalIdentifier>swap-exact-tokens-for-tokens</ApprovalIdentifier>}
            />
            <ApprovalDisclosureRow
              label="All details"
              caption="Arguments, nonce, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'state-price-unavailable',
    family: 'state',
    label: 'No price for the asset',
    method: 'stx_transferStx · price lookup failed',
    refs: ['#2624'],
    events: [viewed('stx_transferStx', 'transfer', 'note'), decided('approve', '3_to_10s')],
    note: 'When Leather has no USD price, every place a price would go says No price, and the priced-ago line under the total disappears. A $0.00 would read as worthless, and a blank would read as a layout bug. The amounts stay exact, because they come from the transaction, not from the price. One quiet note says why, so the missing prices do not look like a broken screen.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{
                amount: <ExactAmount value="250.003000" symbol="STX" />,
                fiat: noFiatPrice,
              }}
            />
          }
        >
          <ApprovalHeader requester={explorer} account={unpricedAccount1} network={mainnet} />
          <ApprovalIntent title="Send 250 STX" kind="STX transfer · built by Leather" />
          <ApprovalNote>
            Leather couldn’t get a price for STX just now. The amounts are exact; USD values come
            back when the price does.
          </ApprovalNote>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="250.000000" symbol="STX" />}
              fiat={noFiatPrice}
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={stxRecipient} />} />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={noFiatPrice}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Only this amount and the fee can leave your account. Anything else makes the transfer
              fail.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
            <ApprovalDisclosureRow label="All details" caption="Nonce, raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'state-fee-unavailable',
    family: 'state',
    label: 'Fee estimate unavailable',
    method: 'sendTransfer · fee estimate failed',
    events: [
      viewed('sendTransfer', 'bitcoin_send', 'note'),
      detailsOpened('section'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'When the fee estimate fails, Leather falls back to the last rate it had, says so on the fee row with its age, and keeps Edit one tap away; a note says what that can mean for confirmation time. That is the honest option: the fee shown is exact and is the one signed, only its freshness is in doubt, and a Bitcoin send can be sped up later. With no rate at all there is nothing honest to show, so the fee row reads Set a fee and Send stays disabled until one is entered; Leather never fills in a silent default.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{ amount: <ExactAmount value="0.00300846" symbol="BTC" />, fiat: '$330.26' }}
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
            <ApprovalFeeRow
              amount={<ExactAmount value="0.00000846" symbol="BTC" />}
              fiat="$0.93"
              caption={['6 sat/vB · last known rate', 'From 8 min ago; no fresh estimate']}
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="final">
              Your signature covers every input and output. If anything changes, it no longer
              counts.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalNote>
            Leather couldn’t reach its fee estimate, so this uses the last rate it had. If the
            network is busier now it may take longer to confirm, and you can speed it up after
            sending.
          </ApprovalNote>
          <ApprovalSection
            label="Details"
            divided
            collapsible
            summary="Inputs and outputs, raw transaction"
          >
            <ApprovalRow
              label="Paying from"
              value="Native SegWit"
              caption={`${truncateMiddle(btcAccount1.nativeSegwit, 4)} · change returns here`}
            />
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
    id: 'state-refreshed',
    family: 'state',
    label: 'Facts changed while the window was open',
    method: 'stx_transferStx · re-checked after 60 s',
    events: [
      viewed('stx_transferStx', 'transfer', 'note'),
      decided('approve', 'over_120s'),
      resulted('broadcast'),
    ],
    note: 'A request left open for a minute gets its price and fee checked again before anything is signed. Rows whose facts changed carry an Updated tag with the old value, the total says it was priced just now, and because the total changed, the primary goes through the short click guard again, so a click aimed at the old numbers does not land on the new ones. In the Viewer the screen opens with the old numbers and updates after a moment. Today nothing is re-checked: the fee and price stay as they were when the window opened.',
    render() {
      return <RefreshedScreen />;
    },
  },
  {
    id: 'state-request-expired',
    family: 'state',
    label: 'Sign-in request expired while open',
    method: 'signMessage · Leather sign-in text, Expires passed',
    events: [viewed('signMessage', 'message', 'blocking'), decided('expired', 'over_120s')],
    note: 'A sign-in message carries its own expiry. When that time passes while the window is open, the screen swaps to this one: there is nothing to sign, the rows say when it was issued and when it expired, and the only button is Close, which tells the site the request expired so it can ask again. Signing it anyway would hand the site a signature it rejects. Today the expiry line is only text inside the raw message.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter single primaryLabel="Close" signerLabel="Account" />}
        >
          <ApprovalHeader requester={leatherApp} account={btcSigner} network={mainnet} />
          <ApprovalIntent
            title="This sign-in request expired"
            kind="It ran out while this window was open. There’s nothing to sign; the site can ask again."
          />
          <ApprovalSection>
            <ApprovalRow label="Domain" value="app.leather.io" caption="Matches the site asking" />
            <ApprovalRow label="Application" value="Multisig" />
            <ApprovalRow label="Issued" value="25 Sep 2026, 10:42" />
            <ApprovalRow label="Expired" value="25 Sep 2026, 10:52" caption="3 min ago" />
          </ApprovalSection>
          <ApprovalNote>
            Leather checks the expiry when the request arrives and again before it signs, so it
            never signs something the site would turn down.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
];
