import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Badge, SbtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import {
  cautionShown,
  decided,
  detailsOpened,
  frictionCompleted,
  resulted,
  viewed,
} from '../approval-flows.events';
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
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalPanel, ApprovalTray } from '../pattern/approval-tray';
import type { ApprovalRequester } from '../pattern/approval-types';
import { StakeHistory, SwapHistory } from './activity-histories';
import {
  account1,
  account1Stx,
  bitflow,
  contracts,
  dryRunSource,
  explorer,
  feeUnderOneCent,
  leatherApp,
  mainnet,
  vaultAccount,
  vaultBroadcastRule,
  zest,
} from './fixtures';
import type { Scenario } from './scenario';

const lottoSite: ApprovalRequester = {
  origin: 'https://app.lottostx.xyz',
  connection: 'connected',
};

const lottoContract = 'SP3QXJ7T4W1ZP8Y9BQ2KGF5R6V0NMHC4DAE8S1TKR.lotto-v2';
const deployedContract = `${account1.address}.my-token`;

function contractName(contractId: string) {
  return contractId.split('.')[1] ?? contractId;
}

const myTokenSource = `(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token my-token u1000000000000000)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (ft-transfer? my-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-read-only (get-name)
  (ok "My Token"))

(define-read-only (get-symbol)
  (ok "MYT"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance my-token who)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply my-token)))

(define-read-only (get-token-uri)
  (ok none))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? my-token amount recipient)))`;

const myTokenLineCount = myTokenSource.split('\n').length;

const swapRawTransaction =
  '00000000010400a46ff88886c2ef9762d970b4d2c63678835bd39d000000000000002a0000000000000bb80001c3f1a09e7d2b4c8e5f6a1b3d9e0f2c4a6b8d1e3f5a7c9b0d2e4f6a8c1b3d5e7f9a0b2c4d6e8f1a3b5c7d9e0f2a4b6c8d1e3f5a7b9c0d2e4f6a8b1c3d5e7f9a0b030200000002000216a46ff88886c2ef9762d970b4d2c63678835bd39d01000000003b9aca000103140f2cd2f1b54f8a3e8e9f7b4c6a1d3e2f5a6b7c8d1778796b2d706f6f6c2d736274632d7374782d762d312d3114e4c5b8f1a2d3c4b5a6978877665544332211ffee0a736274632d746f6b656e0a736274632d746f6b656e0300000000000b371802140f2cd2f1b54f8a3e8e9f7b4c6a1d3e2f5a6b7c8d1578796b2d737761702d68656c7065722d762d312d330d737761702d68656c7065722d6100000005010000000000000000000000003b9aca0001000000000000000000000000000b3718090c00000002016106140f2cd2f1b54f8a3e8e9f7b4c6a1d3e2f5a6b7c8d0f746f6b656e2d7374782d762d312d3201620614e4c5b8f1a2d3c4b5a6978877665544332211ffee0a736274632d746f6b656e0c00000001016106140f2cd2f1b54f8a3e8e9f7b4c6a1d3e2f5a6b7c8d1778796b2d706f6f6c2d736274632d7374782d762d312d31';

const swapRawTransactionBytes = swapRawTransaction.length / 2;

interface SwapArgumentField {
  key: string;
  value: string;
}

interface SwapArgument {
  name: string;
  type: string;
  value?: string;
  fields?: SwapArgumentField[];
  decoded?: ReactNode;
}

const swapArguments: SwapArgument[] = [
  {
    name: 'amount',
    value: 'u1000000000',
    type: 'uint',
    decoded: <ExactAmount value="1,000.000000" symbol="STX" />,
  },
  {
    name: 'min-received',
    value: 'u735000',
    type: 'uint',
    decoded: <ExactAmount value="0.00735000" symbol="sBTC" />,
  },
  { name: 'provider', value: 'none', type: 'optional' },
  {
    name: 'swap-tokens',
    type: 'tuple',
    fields: [
      { key: 'a', value: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2' },
      { key: 'b', value: contracts.sbtcToken },
    ],
  },
  {
    name: 'swap-pools',
    type: 'tuple',
    fields: [
      { key: 'a', value: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-pool-sbtc-stx-v-1-1' },
    ],
  },
];

interface ArgumentRowProps {
  argument: SwapArgument;
}

function ArgumentRow({ argument }: ArgumentRowProps) {
  return (
    <Stack gap="space.01" py="space.02">
      <Flex justifyContent="space-between" alignItems="baseline" gap="space.03">
        <styled.span textStyle="label.03">{argument.name}</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
          {argument.type}
        </styled.span>
      </Flex>
      {argument.value && (
        <Flex justifyContent="space-between" alignItems="baseline" gap="space.03">
          <ApprovalIdentifier principal>{argument.value}</ApprovalIdentifier>
          {argument.decoded && (
            <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
              {argument.decoded}
            </styled.span>
          )}
        </Flex>
      )}
      {argument.fields?.map(field => (
        <Flex key={field.key} alignItems="baseline" gap="space.03">
          <styled.span textStyle="caption.01" color="ink.text-subdued" width="12px" flexShrink={0}>
            {field.key}
          </styled.span>
          <ApprovalIdentifier principal>{field.value}</ApprovalIdentifier>
        </Flex>
      ))}
    </Stack>
  );
}

function SwapDetailsTray() {
  return (
    <ApprovalTray title="All details" maxHeight="73%">
      <ApprovalSection label="Post conditions">
        <ApprovalRow
          label="Mode"
          value={<Badge label="Strict" textColor="primary" />}
          caption="Sent as deny"
        />
        <ApprovalRow
          label="You send, exactly"
          value={<ExactAmount value="1,000.000000" symbol="STX" />}
          caption={truncateMiddle(account1.address, 4)}
        />
        <ApprovalRow
          label="Contract sends, at least"
          value={<ExactAmount value="0.00735000" symbol="sBTC" />}
          caption="xyk-pool-sbtc-stx-v-1-1"
        />
      </ApprovalSection>
      <ApprovalSection label="Call" divided>
        <ApprovalRow
          stacked
          label="Contract"
          value={<ApprovalIdentifier principal>{contracts.bitflowSwap}</ApprovalIdentifier>}
        />
        <ApprovalRow
          label="Function"
          value={<ApprovalIdentifier>swap-helper-a</ApprovalIdentifier>}
        />
      </ApprovalSection>
      <ApprovalSection label="Arguments" divided>
        {swapArguments.map(argument => (
          <ArgumentRow key={argument.name} argument={argument} />
        ))}
      </ApprovalSection>
      <ApprovalSection label="Transaction" divided>
        <ApprovalRow label="Nonce" value="42" caption="Next for Account 1" />
        <ApprovalRow
          label="Fee"
          value={<ExactAmount value="0.003000" symbol="STX" />}
          caption="3,000 µSTX"
        />
      </ApprovalSection>
      <ApprovalSection
        label="Raw transaction"
        trailing={<ApprovalCopyAction caption={`${swapRawTransactionBytes} bytes`} />}
        divided
      >
        <ApprovalPanel mono maxHeight="132px">
          {swapRawTransaction}
        </ApprovalPanel>
      </ApprovalSection>
    </ApprovalTray>
  );
}

interface StakeScreenProps {
  isVault?: boolean;
}

function StakeScreen({ isVault }: StakeScreenProps) {
  const fee = isVault ? '0.004800' : '0.003000';
  const title = isVault
    ? 'Propose staking 5,000\u00a0STX with Fast Pool'
    : 'Stake 5,000\u00a0STX with Fast Pool';
  const kind = isVault
    ? 'Vault proposal · PoX-5 staking, recognised by Leather'
    : 'Contract call · PoX-5 staking, recognised by Leather';
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel={isVault ? 'Propose' : 'Approve'}
          reversibility={isVault ? 'proposal' : undefined}
          total={{
            label: isVault ? 'Total from vault' : 'Total spent',
            amount: <ExactAmount value={fee} symbol="STX" />,
            fiat: feeUnderOneCent,
          }}
          secondaryTotal={{
            label: isVault ? 'Locked, stays in the vault' : 'Locked, stays in your account',
            amount: <ExactAmount value="5,000.000000" symbol="STX" />,
          }}
        />
      }
    >
      <ApprovalHeader
        requester={leatherApp}
        account={isVault ? vaultAccount : account1Stx}
        network={mainnet}
      />
      <ApprovalIntent title={title} kind={kind} />
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label={isVault ? 'Team Treasury locks' : 'You lock'}
          qualifier={isVault ? 'For up to 12 cycles' : 'Exactly, for up to 12 cycles'}
          amount={<ExactAmount value="5,000.000000" symbol="STX" />}
          fiat="$4,062.00"
        />
        <ApprovalFeeRow
          amount={<ExactAmount value={fee} symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption={isVault ? 'Standard for 2 of 3 · paid by the vault' : 'Standard'}
          action={<ApprovalRowAction label="Edit" />}
        />
        <ApprovalGuarantee kind="strict">
          Only the fee can leave {isVault ? 'the vault' : 'your account'}. If anything else moves,
          the transaction fails.
        </ApprovalGuarantee>
        <ApprovalGuarantee kind="staking">
          It must stake exactly 5,000 STX. If it stakes a different amount, it fails.
        </ApprovalGuarantee>
      </ApprovalSection>
      {isVault && (
        <ApprovalNote>
          Your signature is included: Propose signs the commitment and the transaction with Account
          1’s key, and nothing locks yet. {vaultBroadcastRule}
        </ApprovalNote>
      )}
      <ApprovalSection label="Staking" divided>
        <ApprovalRow
          label="Pool"
          value="Fast Pool"
          caption={contractName(contracts.signerManager)}
        />
        <ApprovalRow
          label="Staked for"
          value="Up to 12 cycles"
          caption="From cycle 132 · unstake at any cycle end"
        />
        <ApprovalRow label="Rewards" value="Paid in sBTC" caption="Claimable each cycle" />
      </ApprovalSection>
      <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
        <ApprovalContractRow label="Contract" contractId={contracts.pox5} />
        <ApprovalRow label="Function" value={<ApprovalIdentifier>stake</ApprovalIdentifier>} />
        <ApprovalDisclosureRow label="All details" caption="Arguments, nonce, raw transaction" />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const contractCallScenarios: Scenario[] = [
  {
    id: 'contract-call-known',
    family: 'contract-call',
    label: 'Contract call from a known protocol',
    method: 'stx_callContract · deny mode',
    captureId: '01-stx-call-contract',
    refs: ['#2700', '#2587', '#2326'],
    events: [
      viewed('stx_callContract', 'contract_call', 'none', true),
      decided('approve', '3_to_10s'),
      resulted('broadcast'),
    ],
    note: 'The headline is written by Leather from the decoded call, never by the site. Post conditions become the “what moves” block, phrased as limits, with one line saying the limits are enforced on-chain. Today the title flips between “Sign contract” and “Sign transaction” on whether post conditions exist, and the total shows only the fee, in US dollars; arguments and the raw transaction now sit one tap away.',
    history() {
      return <SwapHistory />;
    },
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              total={{
                amount: <ExactAmount value="1,000.003000" symbol="STX" />,
                fiat: '$812.40',
              }}
            />
          }
        >
          <ApprovalHeader requester={bitflow} account={account1Stx} network={mainnet} />
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
              value={<ApprovalIdentifier>swap-helper-a</ApprovalIdentifier>}
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
    id: 'contract-call-unknown',
    family: 'contract-call',
    label: 'Contract call Leather does not recognise',
    method: 'stx_callContract · deny mode',
    refs: ['#2700', '#2587'],
    events: [
      viewed('stx_callContract', 'contract_call', 'none', false),
      detailsOpened('all_details'),
      decided('approve', '30_to_120s'),
      resulted('broadcast'),
    ],
    note: 'When the contract is not on the Leather-owned list, the title falls back to the function name and the kind line carries the full contract id, so nothing on screen is the site’s own wording. Post conditions still drive what moves and the Strict badge. The list does not exist yet: it needs a small Leather-maintained registry the extension can read.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              total={{
                amount: <ExactAmount value="25.003000" symbol="STX" />,
                fiat: '$20.31',
              }}
            />
          }
        >
          <ApprovalHeader requester={lottoSite} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Call enter-draw, sending 25 STX"
            kind={
              <>
                Contract call to <ApprovalIdentifier principal>{lottoContract}</ApprovalIdentifier>
              </>
            }
          />
          <ApprovalNote>
            Leather doesn’t recognise this contract. Make sure the id above is the one you expect.
          </ApprovalNote>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="25.000000" symbol="STX" />}
              fiat="$20.31"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Every movement is listed here. If anything else moves, the transaction fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Function, arguments, nonce">
            <ApprovalRow
              label="Function"
              value={<ApprovalIdentifier>enter-draw</ApprovalIdentifier>}
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
    id: 'contract-call-originator',
    family: 'contract-call',
    label: 'Claim staking rewards, originator mode',
    method: 'stx_callContract · originator mode, no post conditions',
    refs: ['#2659', '#2326', '#2700'],
    note: 'Today this reads exactly like Strict (“only fees will be transferred”) and says nothing about what arrives. Originator mode gets its own badge and promise. The incoming sBTC shows the amount from a dry run of the claim (the call played against the current chain without broadcasting it), tagged Estimate with its source, because nothing on-chain limits what arrives and the contract only works it out when the claim runs. If the dry run can’t run, the row falls back to Set by the contract. The title names the cycle because each claim covers one, and You receive is shown only when the staker argument is the signing account, because the contract lets anyone claim for any staker.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              total={{
                amount: <ExactAmount value="0.003000" symbol="STX" />,
                fiat: feeUnderOneCent,
              }}
            />
          }
        >
          <ApprovalHeader requester={leatherApp} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Claim staking rewards for cycle 131"
            kind="Contract call · Fast Pool rewards, recognised by Leather"
          />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You receive"
              qualifier="Cycle 131, after pool fees"
              amount={<ExactAmount value="0.00012840" symbol="sBTC" />}
              fiat="≈ $14.10"
              direction="in"
              estimateSource={dryRunSource}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="account-only">
              Nothing but the fee can leave it. What the contract sends you is not checked.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
            <ApprovalContractRow label="Contract" contractId={contracts.signerManager} />
            <ApprovalRow
              label="Function"
              value={<ApprovalIdentifier>claim-staker-rewards</ApprovalIdentifier>}
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
    id: 'contract-call-allow',
    family: 'contract-call',
    label: 'Contract call in unrestricted mode',
    method: 'stx_callContract · allow mode',
    captureId: '02-stx-call-contract-allow-mode',
    refs: ['#2326'],
    events: [
      viewed('stx_callContract', 'contract_call', 'caution', false),
      cautionShown('allow_mode'),
      frictionCompleted('hold'),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'Today the allow-mode warning replaces the post-condition list, so the one limit the app did set disappears. Here the list stays under the caution, the Unrestricted badge says what the mode means, and the callout names who asked for it. Approve needs a press and hold, because this is the one mode where anything can leave the account.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              confirmation={{ mode: 'hold' }}
              total={{
                label: 'Listed total',
                amount: <ExactAmount value="1,500.003000" symbol="STX" />,
                fiat: '$1,218.60',
              }}
              hint={
                <styled.p textStyle="caption.01" color="ink.text-subdued">
                  Unlisted transfers are not counted.
                </styled.p>
              }
            />
          }
        >
          <ApprovalHeader requester={zest} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Supply 1,500 STX to Zest"
            kind="Contract call · Zest lending, recognised by Leather"
          />
          <ApprovalCaution title="This call can move any of your assets" source="the app’s request">
            The app turned off the limit on unlisted transfers. Approve only if you trust this app
            and contract.
          </ApprovalCaution>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1,500.000000" symbol="STX" />}
              fiat="$1,218.60"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="unrestricted">
              The listed limit is checked. Anything not listed can also leave your account.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
            <ApprovalContractRow label="Contract" contractId={contracts.zestBorrowHelper} />
            <ApprovalRow label="Function" value={<ApprovalIdentifier>supply</ApprovalIdentifier>} />
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
    id: 'contract-call-staking',
    family: 'contract-call',
    label: 'Stake STX with a pool',
    method: 'stx_callContract · pox-5 stake · deny mode',
    refs: ['#2587', '#2710'],
    note: 'Staking locks STX in your account rather than sending it, so the row says You lock and the footer separates the fee that is spent from the 5,000 STX that is locked; today the total shows only the fee. The period reads Up to 12 cycles because the stake can be ended early, and an unstake takes effect at the end of a cycle. The period, start cycle and payout come from the call’s arguments (a BTC payout would read Paid in BTC to bc1…); the pool name needs the web app’s pool list shared with the extension, which does not exist yet. Locking is not a transfer, so the strict line covers only the fee and a Staking action line, from the new staking post condition (SIP-045), says it must stake exactly 5,000 STX, as on Register the bond on Stacks.',
    history() {
      return <StakeHistory />;
    },
    render() {
      return <StakeScreen />;
    },
  },
  {
    id: 'contract-call-multisig-propose',
    family: 'contract-call',
    label: 'Stake from a vault, as a proposal',
    method: 'stx_callContract · pox-5 stake · deny mode · vault account, propose',
    refs: ['#2587', '#2773', '#2628'],
    events: [
      viewed('stx_callContract', 'vault', 'none', true),
      decided('approve', '30_to_120s'),
      resulted('proposed'),
    ],
    note: 'With a vault connected, the same request becomes a proposal: the header names the vault and who signs, the button says Propose, and one quiet line says Propose signs the commitment and the transaction with Account 1’s key, so it can be broadcast once 2 of 3 signers approve. That needs the two steps combined (today the multisig web app asks twice and other sites send the proposal unsigned), and because a Stacks signature covers the nonce, it needs the vault coordinator to fix the nonce at proposal time instead of when the proposal becomes pending. The fee is sized for a 2 of 3 transaction; today it is estimated on a single-signature transaction, and the nonce row shows the parent account’s next nonce while a placeholder is proposed.',
    render() {
      return <StakeScreen isVault />;
    },
  },
  {
    id: 'deploy-contract',
    family: 'contract-call',
    label: 'Deploy a contract',
    method: 'stx_deployContract · deny mode',
    captureId: '03-stx-deploy-contract',
    refs: ['#2587', '#2771', '#2326'],
    events: [
      viewed('stx_deployContract', 'deploy', 'note'),
      detailsOpened('section'),
      decided('approve', '30_to_120s'),
      resulted('broadcast'),
    ],
    note: 'The contract id is written out in full, your address plus the name, next to the Clarity version that gets signed, and one quiet line says a deployed contract is permanent. The code sits in a fixed-height panel with a line count, so the fee and buttons never scroll away. The fee the app sent is kept and labelled Set by app, with Leather’s suggestion as an edit; today it is replaced without saying so.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Deploy"
              reversibility="permanent"
              total={{
                amount: <ExactAmount value="0.012000" symbol="STX" />,
                fiat: feeUnderOneCent,
              }}
            />
          }
        >
          <ApprovalHeader requester={explorer} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Deploy my-token"
            kind={`Contract deploy · code from ${displayOrigin(explorer.origin)}`}
          />
          <ApprovalSection label="What moves">
            <ApprovalFeeRow
              amount={<ExactAmount value="0.012000" symbol="STX" />}
              fiat={feeUnderOneCent}
              caption={
                <>
                  <styled.span display="block">Set by app</styled.span>
                  <styled.span display="block">
                    Leather suggests <ExactAmount value="0.050000" symbol="STX" />
                  </styled.span>
                </>
              }
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Only the fee can leave your account. If deploying moves anything else, it fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalNote>
            Once deployed, the contract and its name can’t be changed or removed.
          </ApprovalNote>
          <ApprovalSection label="Contract" divided>
            <ApprovalRow
              stacked
              label="Contract id"
              value={<ApprovalIdentifier principal>{deployedContract}</ApprovalIdentifier>}
              caption="Your address plus the contract name"
            />
            <ApprovalRow label="Clarity version" value="Clarity 3" />
            <ApprovalRow
              stacked
              label="Code"
              action={
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {myTokenLineCount} lines
                </styled.span>
              }
              value={
                <ApprovalPanel mono maxHeight="176px">
                  {myTokenSource}
                </ApprovalPanel>
              }
            />
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Nonce, raw transaction">
            <ApprovalDisclosureRow label="All details" caption="Nonce, raw transaction" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'contract-call-details-tray',
    family: 'contract-call',
    label: 'All details, opened',
    method: 'stx_callContract · deny mode · details tray',
    refs: ['#2587', '#2700'],
    note: 'The tray opens over the review instead of replacing it, so the site and the title stay in view. It leads with the post conditions and their mode, then the call with its arguments as name, value and type, and the raw transaction can be copied to compare on another device. Everything here is the exact form of what the main screen summarises; there is no raw view on any Stacks approval today.',
    render() {
      return (
        <ApprovalShell
          overlay={<SwapDetailsTray />}
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              total={{
                amount: <ExactAmount value="1,000.003000" symbol="STX" />,
                fiat: '$812.40',
              }}
            />
          }
        >
          <ApprovalHeader requester={bitflow} account={account1Stx} network={mainnet} />
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
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
