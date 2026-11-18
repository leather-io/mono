import { type ReactNode, createContext, useContext, useId, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, SbtcAvatarIcon } from '@leather.io/ui';

import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalLedgerDevice } from '../pattern/approval-ledger-device';
import { ApprovalLedgerSheet } from '../pattern/approval-ledger-sheet';
import { ApprovalCaution, ApprovalNote } from '../pattern/approval-notices';
import { useApprovalOptions } from '../pattern/approval-options';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
  ApprovalFeeRow,
  ApprovalRow,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import type { ApprovalAccount, ApprovalRequester } from '../pattern/approval-types';
import { account1Sbtc, contracts, mainnet } from './fixtures';
import type { Scenario } from './scenario';

type FeeFlowStage =
  | 'review'
  | 'connect'
  | 'fee'
  | 'call'
  | 'signed'
  | 'pending'
  | 'fee-paid'
  | 'confirmed'
  | 'failed'
  | 'canceled'
  | 'expired';

interface FeeFlowContextValue {
  stages: Record<string, FeeFlowStage>;
  setStage(id: string, stage: FeeFlowStage): void;
}

const FeeFlowContext = createContext<FeeFlowContextValue>({
  stages: {},
  setStage() {
    return undefined;
  },
});

interface SbtcFeeFlowProviderProps {
  children: ReactNode;
}

export function SbtcFeeFlowProvider({ children }: SbtcFeeFlowProviderProps) {
  const [stages, setStages] = useState<Record<string, FeeFlowStage>>({});
  return (
    <FeeFlowContext.Provider
      value={{
        stages,
        setStage(id, stage) {
          setStages(current => ({ ...current, [id]: stage }));
        },
      }}
    >
      {children}
    </FeeFlowContext.Provider>
  );
}

function useFeeFlow(id: string) {
  const { stages, setStage } = useContext(FeeFlowContext);
  return {
    stage: stages[id] ?? 'review',
    setStage(stage: FeeFlowStage) {
      setStage(id, stage);
    },
  };
}

const feeRecipient = 'SP3TP7XMD6XYV79SHK4HYY94EGQZZ7SB5DH3RB9AC';
const callContract = 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.amm-pool-v2';
const callArguments = `token-x: ${contracts.sbtcToken}\ntoken-y: SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.token-wstx\ndx: u100000\nmin-dy: u158200000`;
const feeAmount = '0.00000288';
const callAmount = '0.00100000';
const totalAmount = '0.00100288';
const feeNonce = 12;
const callNonce = 13;
const softwareId = 'sbtc-fee-software';
const ledgerId = 'sbtc-fee-ledger';
const requester: ApprovalRequester = {
  origin: 'https://app.example.com',
  connection: 'connected',
};
const softwareAccount: ApprovalAccount = {
  ...account1Sbtc,
  balance: { amount: '0.00250000', symbol: 'sBTC' },
};
const hardwareAccount: ApprovalAccount = { ...softwareAccount, signer: 'ledger' };

function isSubmitted(stage: FeeFlowStage) {
  return ['pending', 'fee-paid', 'confirmed', 'failed'].includes(stage);
}

interface PreviewEvent {
  label: string;
  next: FeeFlowStage;
}

function previewEvents(stage: FeeFlowStage): PreviewEvent[] {
  if (stage === 'connect') return [{ label: 'Device account matches', next: 'fee' }];
  if (stage === 'fee') return [{ label: 'Device approved fee', next: 'call' }];
  if (stage === 'call') return [{ label: 'Device approved call', next: 'signed' }];
  if (stage === 'pending') return [{ label: 'Fee confirmed', next: 'fee-paid' }];
  if (stage === 'fee-paid') {
    return [
      { label: 'Call confirmed', next: 'confirmed' },
      { label: 'Call aborted on chain', next: 'failed' },
    ];
  }
  return [];
}

interface SbtcFeePreviewControlsProps {
  scenarioId: string;
}

export function SbtcFeePreviewControls({ scenarioId }: SbtcFeePreviewControlsProps) {
  const { stage, setStage } = useFeeFlow(scenarioId);
  const labelId = useId();
  if (scenarioId !== softwareId && scenarioId !== ledgerId) return null;
  const canExpire = ['review', 'connect', 'fee', 'call', 'signed'].includes(stage);
  const canReject = stage === 'fee' || stage === 'call';
  return (
    <Stack gap="space.03" role="group" aria-labelledby={labelId}>
      <styled.h3 id={labelId} textStyle="label.03">
        Simulated two-transaction flow
      </styled.h3>
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        Phase-two design study, based on #2863. No real signatures or broadcasts. Ledger is already
        paired; the existing Ledger journeys cover browser permission and recovery.
      </styled.p>
      {[
        ...previewEvents(stage),
        ...(canReject
          ? [{ label: 'Device rejected · discard both', next: 'canceled' } satisfies PreviewEvent]
          : []),
        ...(canExpire
          ? [{ label: 'Quote expired · discard both', next: 'expired' } satisfies PreviewEvent]
          : []),
        { label: 'Restart review', next: 'review' } satisfies PreviewEvent,
      ].map(event => (
        <styled.button
          key={event.label}
          type="button"
          textStyle="label.03"
          textAlign="left"
          cursor="pointer"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="sm"
          px="space.03"
          py="space.02"
          onClick={() => setStage(event.next)}
        >
          {event.label}
        </styled.button>
      ))}
    </Stack>
  );
}

function resultTitle(stage: FeeFlowStage) {
  if (stage === 'confirmed') return 'Contract call confirmed';
  if (stage === 'failed') return 'Call failed · fee paid';
  if (stage === 'canceled') return 'Approval canceled';
  if (stage === 'expired') return 'Fee quote expired';
  if (stage === 'signed') return 'Both transactions signed';
  return 'Contract call pending';
}

function feeStatus(stage: FeeFlowStage) {
  if (stage === 'pending') return 'Pending';
  return 'Confirmed';
}

function callStatus(stage: FeeFlowStage) {
  if (stage === 'pending') return 'Waiting for fee payment';
  if (stage === 'confirmed') return 'Confirmed';
  if (stage === 'failed') return 'Aborted on chain';
  return 'Pending';
}

function totalForStage(stage: FeeFlowStage) {
  return stage === 'failed' ? feeAmount : totalAmount;
}

interface SbtcFeeFlowProps {
  id: string;
  isLedger: boolean;
  isHistory?: boolean;
}

function SbtcFeeFlow({ id, isLedger, isHistory }: SbtcFeeFlowProps) {
  const flow = useFeeFlow(id);
  const { isSolo } = useApprovalOptions();
  const stage = isHistory && !isSubmitted(flow.stage) ? 'pending' : flow.stage;
  const account = isLedger ? hardwareAccount : softwareAccount;
  const showSheet = !isHistory && ['connect', 'fee', 'call'].includes(stage);
  const isReview = stage === 'review' || showSheet;
  const submitted = isSubmitted(stage);
  const isStopped = stage === 'canceled' || stage === 'expired';
  const showFeeStep = stage === 'fee';
  const stepLabel = showFeeStep ? '1 of 2 · Pay the fee' : '2 of 2 · Contract call';
  const sheetTitle = stage === 'connect' ? 'Connect your Ledger' : stepLabel;

  function approve() {
    if (stage === 'review') flow.setStage(isLedger ? 'connect' : 'signed');
    if (stage === 'signed') flow.setStage('pending');
    if (isStopped) flow.setStage('review');
  }

  function primaryLabel() {
    if (isStopped) return 'Review again';
    if (submitted) return 'Submitted';
    if (stage === 'signed') return 'Submit both';
    if (isLedger) return 'Continue';
    return 'Sign both';
  }

  return (
    <ApprovalShell
      isBackgroundInert={showSheet}
      footer={
        <ApprovalFooter
          primaryLabel={primaryLabel()}
          single={submitted || isStopped}
          isPrimaryDisabled={showSheet || submitted}
          hint={
            isReview ? (
              <styled.p textStyle="caption.01">The fee stays paid if the call fails.</styled.p>
            ) : undefined
          }
          secondaryLabel={stage === 'signed' ? 'Discard both' : 'Cancel'}
          total={{
            label: stage === 'failed' || isStopped ? 'You paid' : 'Maximum out',
            amount: <ExactAmount value={isStopped ? '0' : totalForStage(stage)} symbol="sBTC" />,
          }}
          onPrimaryClick={approve}
          onSecondaryClick={() => flow.setStage('canceled')}
        />
      }
      overlay={
        showSheet ? (
          <ApprovalLedgerSheet
            title={sheetTitle}
            description="Sign the fee payment first, then the contract call."
            isInteractive={isSolo}
            onDismiss={() => flow.setStage('canceled')}
          >
            <Flex direction="column" flex="1" minHeight={0} width="100%">
              <Box flex="1" minHeight={0} overflowY="auto" aria-live="polite">
                <ApprovalSection>
                  <ApprovalLedgerDevice stage={stage === 'connect' ? 'connect' : 'device'} />
                  <styled.p textStyle="label.02">
                    {stage === 'connect' ? 'Open the Stacks app' : 'Confirm on your Ledger'}
                  </styled.p>
                  <styled.p textStyle="body.02">
                    {stage === 'connect'
                      ? 'Connect and unlock the Ledger for Account 1. You will confirm two transactions.'
                      : 'Compare these details with your Ledger. Reject if they differ.'}
                  </styled.p>
                  {stage !== 'connect' && (
                    <>
                      <ApprovalRow
                        label="Amount out"
                        value={`${showFeeStep ? feeAmount : callAmount} sBTC`}
                      />
                      <ApprovalContractRow
                        label="Contract"
                        contractId={showFeeStep ? contracts.sbtcToken : callContract}
                      />
                      <ApprovalRow
                        label="Function"
                        value={showFeeStep ? 'transfer-many' : 'swap-x-for-y'}
                      />
                      {showFeeStep && (
                        <ApprovalRow
                          stacked
                          label="Fee recipient"
                          value={<AddressDisplayer address={feeRecipient} />}
                        />
                      )}
                    </>
                  )}
                </ApprovalSection>
                {stage !== 'connect' && (
                  <ApprovalSection
                    label="Signing details"
                    collapsible
                    summary="Origin, nonce, STX fee and arguments"
                  >
                    <ApprovalRow
                      stacked
                      label="Origin"
                      value={<AddressDisplayer address={account.address} />}
                    />
                    <ApprovalRow label="Nonce" value={showFeeStep ? feeNonce : callNonce} />
                    <ApprovalRow label="STX fee on device" value="0 · service pays STX" />
                    <styled.pre
                      textStyle="caption.01"
                      whiteSpace="pre-wrap"
                      overflowWrap="anywhere"
                    >
                      {showFeeStep
                        ? `(list (tuple (amount u288) (sender ${account.address}) (to ${feeRecipient}) (memo none)))`
                        : callArguments}
                    </styled.pre>
                  </ApprovalSection>
                )}
              </Box>
              <ApprovalFooter
                primaryLabel="Confirm on Ledger"
                isPrimaryDisabled
                secondaryLabel="Cancel both"
                hint={
                  stage !== 'connect' ? (
                    <styled.p textStyle="caption.01" role="status">
                      {showFeeStep
                        ? 'Next: sign the call. Nothing submitted yet.'
                        : 'Fee signed. Cancel now to discard both.'}
                    </styled.p>
                  ) : undefined
                }
                onSecondaryClick={() => flow.setStage('canceled')}
              />
            </Flex>
          </ApprovalLedgerSheet>
        ) : undefined
      }
    >
      <ApprovalHeader requester={requester} account={account} network={mainnet} />
      <ApprovalIntent
        title={isReview ? 'Call swap-x-for-y' : resultTitle(stage)}
        kind="Contract call · fee paid in sBTC"
      />
      {isReview && (
        <>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="Call can spend"
              amount={<ExactAmount value={callAmount} symbol="sBTC" />}
            />
            <ApprovalFeeRow
              amount={<ExactAmount value={feeAmount} symbol="sBTC" />}
              caption="Covers both transactions · service pays STX"
            />
          </ApprovalSection>
          <ApprovalSection label="Two transactions" divided>
            <ApprovalRow
              label="1 · Pay the fee"
              value={`${feeAmount} sBTC`}
              caption="Signed first · confirms first"
            />
            <ApprovalRow
              label="2 · Contract call"
              value="swap-x-for-y"
              caption={
                isLedger
                  ? 'Your Ledger asks for a second confirmation'
                  : 'Both signed with this approval'
              }
            />
            <ApprovalCaution title="The fee is paid even if the call fails">
              The fee payment and contract call are separate transactions. Nothing is submitted
              until both are signed.
            </ApprovalCaution>
          </ApprovalSection>
        </>
      )}
      {!isReview && (
        <ApprovalSection label={submitted ? 'In activity' : 'What happens next'}>
          <styled.p textStyle="body.02" role="status">
            {stage === 'signed' &&
              'Both signatures are collected. Nothing has been submitted. Submit both or discard both.'}
            {stage === 'canceled' &&
              'Both transactions were discarded, including any collected signature. Nothing was submitted and no fee was paid.'}
            {stage === 'expired' &&
              'Nothing was submitted. Review a fresh fee quote and sign both transactions again.'}
            {stage === 'pending' &&
              'Both transactions were submitted. The call can confirm only after the fee payment.'}
            {stage === 'fee-paid' && 'The fee is paid. The contract call is still pending.'}
            {stage === 'confirmed' && 'The fee payment and contract call are confirmed.'}
            {stage === 'failed' &&
              'The contract call aborted. Its asset changes reverted; the separate sBTC fee payment remains paid.'}
          </styled.p>
          {submitted && (
            <>
              <ApprovalRow
                label="1 · Fee payment"
                value={feeStatus(stage)}
                caption={`${feeAmount} sBTC · nonce ${feeNonce}`}
              />
              <ApprovalRow
                label="2 · Contract call"
                value={callStatus(stage)}
                caption={`swap-x-for-y · nonce ${callNonce}`}
              />
            </>
          )}
        </ApprovalSection>
      )}
      <ApprovalSection
        label="Details"
        divided
        collapsible
        summary="Both contracts and signing data"
      >
        <ApprovalContractRow label="Call contract" contractId={callContract} />
        <ApprovalRow label="Function" value="swap-x-for-y" />
        <styled.pre textStyle="caption.01" whiteSpace="pre-wrap" overflowWrap="anywhere">
          {callArguments}
        </styled.pre>
        <ApprovalContractRow label="Fee contract" contractId={contracts.sbtcToken} />
        <ApprovalRow label="Fee function" value="transfer-many" />
        <ApprovalRow
          stacked
          label="Fee recipient"
          value={<AddressDisplayer address={feeRecipient} />}
        />
        <ApprovalNote>
          Each transaction has its own spending limits. The pair is not atomic.
        </ApprovalNote>
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const sbtcFeeFlowScenarios: Scenario[] = [false, true].map(isLedger => {
  const id = isLedger ? ledgerId : softwareId;
  return {
    id,
    family: 'contract-call',
    label: isLedger
      ? 'sBTC fee · two Ledger confirmations'
      : 'sBTC fee · one software approval, two signatures',
    method: 'stx_callContract · phase 2 · two-transaction fee flow',
    refs: ['#2863'],
    note: 'Phase-two concept from Edgar’s #2863 example, not production capability. The action leads the review; fee payment remains transaction 1 and the call transaction 2. One software approval signs both; Ledger confirms each separately. Submit is available only after both signatures. Cancel or quote expiry discards both before submission. Activity tracks each transaction and shows the fee remaining paid if the call aborts. Values and generic app/contract are fixtures from #2863. Ledger assumes browser permission already granted. Use the external simulation controls to advance device and chain events.',
    render() {
      return <SbtcFeeFlow id={id} isLedger={isLedger} />;
    },
    history() {
      return <SbtcFeeFlow id={id} isLedger={isLedger} isHistory />;
    },
  };
});
