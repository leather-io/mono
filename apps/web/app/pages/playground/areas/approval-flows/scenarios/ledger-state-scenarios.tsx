import type { ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  BtcAvatarIcon,
  CheckmarkCircleIcon,
  Input,
  LedgerIcon,
  LoadingSpinner,
  SbtcAvatarIcon,
  StxAvatarIcon,
} from '@leather.io/ui';

import { cautionShown, decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { displayOrigin, truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalCaution, ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
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
import { ApprovalSigners } from '../pattern/approval-signers';
import { ApprovalPanel } from '../pattern/approval-tray';
import type { ApprovalAccount } from '../pattern/approval-types';
import { depositAddress } from './bitcoin-parts';
import {
  account1,
  bitflow,
  btcAccount1,
  btcSigner,
  contracts,
  feeUnderOneCent,
  gamma,
  leatherApp,
  ledgerAccount,
  mainnet,
  vaultAccount,
  vaultMember2,
  vaultMember3,
  vaultRequiredSignatures,
  vaultYou,
} from './fixtures';
import type { Scenario } from './scenario';

const sentTxId = '9f2c6a1e4b7d3f80c5a2e9d1b6f4a3c8e7d2b5a9f1c4e6d8b3a7f2e5c9d1a4b6';
const explorerHost = 'mempool.space';

const signedTxId = '0x4bd152f541752c587d1312d1a32e07777a9747718e21f592fa1e56bfa2af78f5';
const rejectedTxId = 'c8a1e5d0f2b94c7e8a3d6f1b0e2c5a9d7f4b8e1c3a6d9f2b5e8c1a4d7f0b3e6a';
const swapContractName = 'xyk-swap-helper-v-1-3';
const swapFunctionName = 'swap-helper-a';
const [swapDeployer = ''] = contracts.bitflowSwap.split('.');

const ledgerBtcSigner: ApprovalAccount = {
  ...ledgerAccount,
  address: btcAccount1.nativeSegwit,
  balance: { amount: '0.08421530', symbol: 'BTC', fiat: '$9,244.99' },
};

const nodeRejection = JSON.stringify({
  error: 'transaction rejected',
  reason: 'ConflictingNonceInMempool',
  txid: rejectedTxId,
});

interface FooterHintProps {
  children: ReactNode;
  action?: ReactNode;
}

function FooterHint({ children, action }: FooterHintProps) {
  return (
    <Flex gap="space.02" alignItems="flex-start">
      <Box pt="2px" flexShrink={0} lineHeight={0}>
        <LedgerIcon variant="small" color="ink.text-subdued" />
      </Box>
      <styled.span textStyle="caption.01" color="ink.text-subdued" minWidth={0}>
        {children} {action}
      </styled.span>
    </Flex>
  );
}

export function DeviceWaitingStatus() {
  return (
    <Flex
      role="status"
      aria-live="polite"
      alignItems="center"
      justifyContent="center"
      gap="space.02"
      minHeight="24px"
    >
      <Box width="16px" flexShrink={0}>
        <LoadingSpinner />
      </Box>
      <styled.span textStyle="label.03">Waiting for your Ledger</styled.span>
    </Flex>
  );
}

interface NumberedStepProps {
  number: number;
  title: string;
  children: ReactNode;
}

function NumberedStep({ number, title, children }: NumberedStepProps) {
  return (
    <Flex gap="space.03" alignItems="flex-start" py="space.02">
      <Flex width="32px" justifyContent="center" flexShrink={0}>
        <Flex
          width="20px"
          height="20px"
          borderRadius="round"
          borderWidth={1}
          borderColor="ink.border-default"
          alignItems="center"
          justifyContent="center"
          textStyle="caption.02"
          color="ink.text-primary"
        >
          {number}
        </Flex>
      </Flex>
      <Stack gap="0" minWidth={0}>
        <styled.span textStyle="label.03">{title}</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {children}
        </styled.span>
      </Stack>
    </Flex>
  );
}

function PendingRingIcon() {
  return (
    <Box color="ink.text-primary" lineHeight={0}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3a9 9 0 1 1-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </Box>
  );
}

type SendStepState = 'done' | 'current' | 'upcoming';

interface SendStep {
  label: string;
  state: SendStepState;
}

const sendSteps: SendStep[] = [
  { label: 'Submitted', state: 'done' },
  { label: 'Pending', state: 'current' },
  { label: 'Confirmed', state: 'upcoming' },
];

interface SendStepDotProps {
  state: SendStepState;
}

function SendStepDot({ state }: SendStepDotProps) {
  if (state === 'done') {
    return <CheckmarkCircleIcon variant="small" color="ink.text-primary" />;
  }
  return (
    <Box
      width="16px"
      height="16px"
      borderRadius="round"
      borderWidth={state === 'current' ? 2 : 1}
      borderColor={state === 'current' ? 'ink.text-primary' : 'ink.text-subdued'}
      bg="ink.background-primary"
    />
  );
}

function SendProgress() {
  return (
    <Stack
      gap="space.02"
      py="space.02"
      role="list"
      aria-label="Progress"
      data-approval-zone="progress"
    >
      <Box position="relative" height="16px">
        <Box
          position="absolute"
          top="7px"
          left="8px"
          right="8px"
          height="2px"
          bg="ink.border-default"
          borderRadius="round"
        />
        <Box
          position="absolute"
          top="7px"
          left="8px"
          height="2px"
          bg="ink.text-primary"
          borderRadius="round"
          style={{ width: 'calc(50% - 8px)' }}
        />
        <Flex position="relative" justifyContent="space-between">
          {sendSteps.map(step => (
            <Box key={step.label} lineHeight={0}>
              <SendStepDot state={step.state} />
            </Box>
          ))}
        </Flex>
      </Box>
      <Flex justifyContent="space-between">
        {sendSteps.map(step => (
          <styled.span
            key={step.label}
            role="listitem"
            aria-current={step.state === 'current' ? 'step' : undefined}
            textStyle={step.state === 'current' ? 'label.03' : 'caption.01'}
            color={step.state === 'upcoming' ? 'ink.text-subdued' : 'ink.text-primary'}
          >
            {step.label}
          </styled.span>
        ))}
      </Flex>
    </Stack>
  );
}

export const ledgerStateScenarios: Scenario[] = [
  {
    id: 'ledger-preflight',
    family: 'state',
    label: 'Ledger, before the device',
    method: 'stx_callContract · Ledger account',
    refs: ['#2699'],
    events: [
      viewed('stx_callContract', 'contract_call', 'note', true),
      decided('approve', '10_to_30s'),
    ],
    note: 'The same review as any contract call, with one quiet line above the button: the Ledger needs blind signing on for this call and warns before approval, and the limits shown, the post conditions, still apply on-chain. Today the device warning arrives with no word from the wallet. Leather can predict the prompt exactly from the unsigned transaction (any list, tuple, buffer, optional or long text argument, and every deploy, on current Stacks apps), so the line shows only when it applies; that check does not exist yet, and the 0.27.1 rules are not public.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve on Ledger"
              total={{
                amount: <ExactAmount value="1,000.003000" symbol="STX" />,
                fiat: '$812.40',
              }}
              hint={
                <FooterHint action={<ApprovalRowAction label="How to allow it" />}>
                  Your Ledger needs blind signing on for this call and warns before you approve. The
                  limits above still apply.
                </FooterHint>
              }
            />
          }
        >
          <ApprovalHeader requester={bitflow} account={ledgerAccount} network={mainnet} />
          <ApprovalIntent
            title="Swap 1,000 STX for sBTC"
            kind="Contract call · Bitflow swap, recognised by Leather"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1,000.000000" symbol="STX" />}
              fiat="$812.40"
            />
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You receive"
              qualifier="At least"
              amount={<ExactAmount value="0.00735000" symbol="sBTC" />}
              fiat="$806.87"
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
            <ApprovalContractRow label="Contract" contractId={contracts.bitflowSwap} />
            <ApprovalRow
              label="Function"
              value={<ApprovalIdentifier>{swapFunctionName}</ApprovalIdentifier>}
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
    id: 'ledger-btc-preflight',
    family: 'state',
    label: 'Ledger, before the device (Bitcoin)',
    method: 'signPsbt · Ledger account · marketplace buy',
    refs: ['#2699', '#2738'],
    events: [
      viewed('signPsbt', 'psbt', 'note'),
      decided('approve', '30_to_120s'),
      resulted('signed'),
    ],
    note: 'The marketplace PSBT for a Ledger account, with the device screens it will trigger listed before Sign, in the order the Bitcoin app shows them, so nothing on the device is a surprise. One input is the seller’s, so the app warns about external inputs first; then it asks to check every output that isn’t change for this account, which includes the item arriving at your own Taproot address, since the app only treats this account’s Native SegWit change as yours; then the fee. Your inputs sign with SIGHASH_ALL, the default, so no sighash warning appears here. Listing an item for sale is the case that needs one: it signs SINGLE|ANYONECANPAY, which the app flags as a non-default sighash, and the preflight would name that step. Leather can work all of this out from the unsigned PSBT. Open questions: the exact wording and order of the warnings in the current Bitcoin app, and whether it still accepts a PSBT with an OP_RETURN output without extra steps; both need checking on a device before build.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Sign on Ledger"
              reversibility="signed-copy"
              total={{
                amount: <ExactAmount value="0.02110000" symbol="BTC" />,
                fiat: '$2,316.32',
              }}
            />
          }
        >
          <ApprovalHeader requester={gamma} account={ledgerBtcSigner} network={mainnet} />
          <ApprovalIntent
            title="Sign a spend of 0.0211 BTC"
            kind="PSBT · you sign 4 of 5 inputs · built by gamma.io"
          />
          <ApprovalSection label="On your Ledger">
            <NumberedStep number={1} title="External inputs">
              1 of 5 inputs isn’t yours. It’s the seller’s, already signed.
            </NumberedStep>
            <NumberedStep number={2} title="Check 4 outputs">
              Your Taproot address, the seller, the marketplace fee and a data output. Change isn’t
              shown.
            </NumberedStep>
            <NumberedStep number={3} title="Fee, then sign">
              0.0001 BTC, set by gamma.io.
            </NumberedStep>
          </ApprovalSection>
          <ApprovalSection label="What moves" divided>
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
            <ApprovalGuarantee kind="final">
              Your signature covers every input and output. If anything changes, it no longer
              counts.
            </ApprovalGuarantee>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'ledger-device',
    family: 'state',
    label: 'Ledger, confirm on the device',
    method: 'stx_callContract · Ledger device step',
    refs: ['#2699'],
    note: 'The device step stays inside the approval instead of a separate sheet. The rows to compare follow the Stacks app’s order, fee and post conditions included, each with its device form below. Today the mirror shows raw micro-STX and leaves out the post conditions the device lists; the exact rows per call need checking against the Stacks app before build.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter single isBusy primaryLabel="Approve" hint={<DeviceWaitingStatus />} />
          }
        >
          <ApprovalHeader requester={bitflow} account={ledgerAccount} network={mainnet} />
          <ApprovalIntent
            title="Confirm on your Ledger"
            kind="Swap 1,000 STX for sBTC. Nothing is signed yet."
          />
          <ApprovalSection label="Compare with your Ledger">
            <ApprovalRow
              stacked
              label="From"
              value={<AddressDisplayer address={ledgerAccount.address} />}
            />
            <ApprovalRow label="Nonce" value="8" />
            <ApprovalRow
              label="Fee"
              value={<ExactAmount value="0.003000" symbol="STX" />}
              caption="Shown as 3000 uSTX on the device"
            />
            <ApprovalRow
              stacked
              label="Contract"
              value={<AddressDisplayer address={swapDeployer} />}
              caption={swapContractName}
            />
            <ApprovalRow
              label="Function"
              value={<ApprovalIdentifier>{swapFunctionName}</ApprovalIdentifier>}
            />
            <ApprovalRow
              label="Post condition"
              value={<ExactAmount value="1,000.000000" symbol="STX" />}
              caption="You send exactly · 1000000000 uSTX on the device"
            />
            <ApprovalRow
              label="Post condition"
              value={<ExactAmount value="0.00735000" symbol="sBTC" />}
              caption="Contract sends at least · 735000 on the device"
            />
          </ApprovalSection>
          <ApprovalNote>
            Your Ledger will also warn about blind signing. That is expected for this call.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'ledger-rejected-payload',
    family: 'state',
    label: 'Ledger rejected the transaction',
    method: 'stx_callContract · Ledger, payload rejected',
    refs: ['#2699'],
    events: [cautionShown('device', 'blocking'), resulted('failed', 'device_rejected')],
    note: 'When the device rejects the payload, the screen says nothing was signed, names the Stacks app as the source and turns the likely cause into a step, with a quiet line for refusals that come with a reason. Today this is “Data Invalid” with only Close, which reads like a broken connection; Try again here restarts the device step without losing the request. The refusal arrives as Data Invalid with no reason text, while real parse errors carry one, so this screen shows only for the empty case; today Leather drops the reason.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Try again" />}>
          <ApprovalHeader requester={bitflow} account={ledgerAccount} network={mainnet} />
          <ApprovalIntent
            title="Your Ledger couldn’t sign this swap"
            kind="Swap 1,000 STX for sBTC. Nothing was signed or sent."
          />
          <ApprovalCaution
            tone="blocking"
            title="The Stacks app refused the transaction data"
            source="Ledger Stacks app"
          >
            Your Ledger answered, so it is connected. The Stacks app refuses this kind of call
            unless blind signing is on.
          </ApprovalCaution>
          <ApprovalSection label="To fix it on your Ledger">
            <NumberedStep number={1} title="Allow blind signing">
              In the Stacks app, open Settings and turn on Blind signing.
            </NumberedStep>
            <NumberedStep number={2} title="Try again">
              Keep the Stacks app open and approve on the device.
            </NumberedStep>
          </ApprovalSection>
          <ApprovalNote>
            Still refused? If your Ledger gives a reason, Leather shows it here instead; blind
            signing does not help with those.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'state-locked',
    family: 'state',
    label: 'Request while Leather is locked',
    method: 'any request · wallet locked',
    refs: ['#2587'],
    note: 'A request that arrives while Leather is locked opens this gate: the requesting site, the kind of request and a password field, with the details held until the wallet is unlocked. Unlock returns to the request, as it does today. What changes is the gate itself: today it is the generic unlock page with the logo and no sign of which site is waiting.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Unlock" />}>
          <ApprovalHeader requester={bitflow} network={mainnet} />
          <ApprovalIntent
            title="Unlock to review this request"
            kind="A contract call from this site is waiting. Its details appear after you unlock."
          />
          <Box px="space.05" py="space.03">
            <Input.Root>
              <Input.Label>Password</Input.Label>
              <Input.Field type="password" autoComplete="current-password" />
            </Input.Root>
          </Box>
          <ApprovalNote icon="shield">
            Your password never leaves this device. Cancel rejects the request and lets the site
            know.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'result-broadcast-error',
    family: 'state',
    label: 'Node rejected the transaction',
    method: 'stx_callContract · broadcast error',
    refs: ['#2587'],
    events: [cautionShown('node', 'blocking'), resulted('failed', 'node_rejected')],
    note: 'When the node refuses a signed transaction, the error stays in the approval: a plain explanation, the pending transaction that holds the nonce, the node’s response unedited, and what was approved. Today a sheet lowercases the node’s message and drops the reason code. Naming the pending transaction needs a mempool lookup by address; Try again re-signs with the next nonce, and Cancel returns the node’s error to the site.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Try again" />}>
          <ApprovalHeader requester={bitflow} account={account1} network={mainnet} />
          <ApprovalIntent
            title="Your swap was not sent"
            kind="Signed, but the Stacks node turned it down. Nothing moved and no fee was paid."
          />
          <ApprovalCaution
            tone="blocking"
            title="Another transaction is using nonce 41"
            source="Stacks node"
          >
            The nonce is the number that puts your transactions in order. A pending transaction from
            Account 1 already has 41. Try again signs this swap with 42, to go out after the pending
            one.
          </ApprovalCaution>
          <ApprovalSection>
            <ApprovalRow
              stacked
              label="Pending at nonce 41"
              value="Claim staking rewards for cycle 131"
              caption="2 min ago"
              action={<ApprovalRowAction label="View" />}
            />
          </ApprovalSection>
          <ApprovalSection label="Node response" trailing={<ApprovalCopyAction />}>
            <ApprovalPanel mono>{nodeRejection}</ApprovalPanel>
          </ApprovalSection>
          <ApprovalSection label="What you approved" divided>
            <ApprovalRow
              label="You send"
              value={<ExactAmount value="1,000.000000" symbol="STX" />}
              caption="$812.40"
            />
            <ApprovalRow
              label="You receive, at least"
              value={<ExactAmount value="0.00735000" symbol="sBTC" />}
              caption="$806.87"
            />
            <ApprovalRow
              label="Network fee"
              value={<ExactAmount value="0.003000" symbol="STX" />}
              caption="Not charged"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'result-sent',
    family: 'state',
    label: 'Sent, waiting to confirm',
    method: 'sendTransfer · broadcast, pending',
    refs: ['#2587'],
    events: [resulted('broadcast')],
    note: 'One result screen follows a send from submitted to pending to confirmed, with the progress line moving and the transaction ID to copy and open in an explorer. While it is pending, Speed up re-sends it with a higher fee: replace-by-fee on Bitcoin, the same nonce with a higher fee on Stacks. Once it confirms, the last step fills, Speed up goes and the line above the buttons reads Can’t be undone. Today the window closes on broadcast and the only trace is a pending row in Activity.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Close"
              secondaryLabel="Speed up"
              signerLabel="Sent from"
              reversibility="replaceable"
            />
          }
        >
          <ApprovalHeader requester={gamma} account={btcSigner} network={mainnet} />
          <ApprovalIntent
            icon={<PendingRingIcon />}
            title="Sending 0.003 BTC"
            kind="Broadcast to the Bitcoin network. It confirms when a miner puts it in a block, usually within 30 min at this fee."
          />
          <ApprovalSection>
            <SendProgress />
          </ApprovalSection>
          <ApprovalSection label="What you sent">
            <ApprovalRow
              label="Transaction ID"
              value={<ApprovalIdentifier>{truncateMiddle(sentTxId, 6)}</ApprovalIdentifier>}
              action={<ApprovalCopyAction />}
            />
            <ApprovalDisclosureRow label={`View on ${explorerHost}`} isExternal />
            <ApprovalAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="You sent"
              qualifier="Exactly"
              amount={<ExactAmount value="0.00300000" symbol="BTC" />}
              fiat="$329.33"
            />
            <ApprovalRecipientRow address={<AddressDisplayer address={depositAddress} />} />
            <ApprovalRow
              label="Network fee"
              value={<ExactAmount value="0.00000765" symbol="BTC" />}
              caption="5 sat/vB"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'result-signed-not-broadcast',
    family: 'state',
    label: 'Signed, not broadcast',
    method: 'stx_signTransaction · sign only',
    refs: ['#2587', '#2399'],
    events: [resulted('signed')],
    note: 'The end of a sign-only request says what happened, in the same words as the request: signed and returned, not broadcast by Leather, with the transaction ID to match later. Today the button reads “Submitting...” and the window closes, which suggests Leather sent it. The line that a signed transaction stays valid is new; today nothing says it.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter single primaryLabel="Close" signerLabel="Signed with" />}
        >
          <ApprovalHeader requester={gamma} account={account1} network={mainnet} />
          <ApprovalIntent
            icon={<CheckmarkCircleIcon color="ink.text-primary" />}
            title="Signed and returned to the site"
            kind={`Transfer of 1.5 STX. Leather did not broadcast it; ${displayOrigin(gamma.origin)} decides whether and when to.`}
          />
          <ApprovalSection label="What you signed">
            <ApprovalRow
              label="Transaction ID"
              value={<ApprovalIdentifier>{truncateMiddle(signedTxId, 6)}</ApprovalIdentifier>}
              action={<ApprovalCopyAction />}
            />
            <ApprovalRow
              label="You send"
              value={<ExactAmount value="1.500000" symbol="STX" />}
              caption="$1.22"
            />
            <ApprovalRow
              label="Network fee"
              value={<ExactAmount value="0.000400" symbol="STX" />}
              caption="Set by app"
            />
            <ApprovalRow label="Nonce" value="41" caption="Set by app" />
          </ApprovalSection>
          <ApprovalNote>
            Nothing moves until it is broadcast. It stays valid until nonce 41 is used, so the site
            could also send it later.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'result-proposed',
    family: 'state',
    label: 'Staking proposed to a vault',
    method: 'stx_callContract · pox-5 stake · vault account, propose',
    refs: ['#2464', '#2587'],
    events: [resulted('proposed')],
    note: 'The result of the vault staking proposal: what was proposed, who has signed and how many signatures are needed, with nothing locked yet; today the popup closes and the web app just goes to the active page. The count starts at 1 of 2 because proposing includes your signature, as the proposal screen says. That depends on combining the two steps: today the multisig web app asks twice and other sites send the proposal unsigned, so it would start at 0 of 2. Each member shows the device they sign with, and the 2 of 3 threshold sits with the signers instead of in the header.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter single primaryLabel="Close" signerLabel="Signed with" />}
        >
          <ApprovalHeader requester={leatherApp} account={vaultAccount} network={mainnet} />
          <ApprovalIntent
            icon={<PendingRingIcon />}
            title={`Staking 5,000\u00a0STX proposed to Team Treasury`}
            kind="Fast Pool. Nothing locks until one more member signs and it is broadcast."
          />
          <ApprovalSection label="What you proposed">
            <ApprovalRow
              label="Team Treasury locks"
              value={<ExactAmount value="5,000.000000" symbol="STX" />}
              caption="$4,062.00"
            />
            <ApprovalRow
              label="Network fee"
              value={<ExactAmount value="0.004800" symbol="STX" />}
              caption="Paid by the vault"
            />
          </ApprovalSection>
          <ApprovalSection label="Signers" divided>
            <ApprovalSigners
              required={vaultRequiredSignatures}
              signers={[
                { ...vaultYou, status: 'signed', detail: 'proposed it' },
                { ...vaultMember2, status: 'waiting' },
                { ...vaultMember3, status: 'waiting' },
              ]}
              caption="Member 2 and Member 3 can sign it in Leather. One more makes 2, then it can be broadcast."
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
