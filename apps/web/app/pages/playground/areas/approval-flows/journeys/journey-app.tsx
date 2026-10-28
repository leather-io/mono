import { type ReactNode, useEffect, useState } from 'react';

import { Box, Flex, Grid, Stack, styled } from 'leather-styles/jsx';

import { isValidBitcoinAddress } from '@leather.io/bitcoin';
import { isValidStacksAddress } from '@leather.io/stacks';
import {
  BlockchainActivityAvatarIcon,
  BlockchainActivityIndicatorIcon,
  Button,
  ListItemBox,
} from '@leather.io/ui';

import { handshakeDirection } from '../directions/handshake-direction';
import { ApprovalDirectionProvider } from '../pattern/approval-direction';
import { ApprovalLedgerDevice } from '../pattern/approval-ledger-device';
import { ApprovalLedgerSheet } from '../pattern/approval-ledger-sheet';
import { ApprovalOptionsProvider } from '../pattern/approval-options';
import { activityListSummary } from '../scenarios/activity-list-fixtures';
import { journeyDefinitions } from './journey-definitions';
import { catalogReturnUrl, prototypeUrl, testerUrl } from './journey-navigation';
import { JourneyReference } from './journey-reference';
import type { JourneyEvent, JourneyRun, JourneyTransaction } from './journey-state';
import { exportJourney, startJourney, useJourneyRun } from './journey-store';
import type { JourneyDefinition, JourneyStep } from './journey-types';
import { JourneyWalletPopover } from './journey-wallet-popover';
import { JourneyApprovalView, JourneyOutcomeView } from './journey-wallet-views';
import { effectiveStep, journeyBalances, receiptBalances, resolveJourney } from './journey-world';

type JourneyDispatch = (event: JourneyEvent) => void;

interface JourneyButtonProps {
  children: ReactNode;
  onClick(): void;
  isDisabled?: boolean;
}

function JourneyButton({ children, onClick, isDisabled }: JourneyButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={isDisabled}>
      {children}
    </Button>
  );
}

function journeyUrl(run: JourneyRun, surface?: string) {
  const params = new URLSearchParams(prototypeUrl(window.location.search, run.journeyId, run.id));
  if (surface) params.set('surface', surface);
  return `${window.location.pathname}?${params.toString()}`;
}

function chooseJourney(id: string) {
  const run = startJourney(id);
  window.location.assign(journeyUrl(run));
}

interface JourneyControlProps {
  run: JourneyRun;
  dispatch: JourneyDispatch;
}

function requestAction(
  run: JourneyRun,
  dispatch: JourneyDispatch,
  type: 'approve' | 'device-approved' | 'reject' | 'confirm' | 'continue'
) {
  if (!run.requestId) return;
  dispatch({
    type,
    runId: run.id,
    revision: run.revision,
    requestId: run.requestId,
    at: Date.now(),
  });
}

interface WalletSurfaceProps extends JourneyControlProps {
  definition: JourneyDefinition;
  step: JourneyStep;
  onBack(): void;
}

function JourneyWalletSurface({ run, dispatch, definition, step, onBack }: WalletSurfaceProps) {
  function onReject() {
    requestAction(run, dispatch, 'reject');
  }
  if (run.stage === 'review' || run.stage === 'device') {
    return (
      <Box height="100%" position="relative">
        <Box height="100%" inert={run.stage === 'device'}>
          <JourneyApprovalView
            definition={definition}
            step={step}
            signer={run.signer}
            onApprove={() => requestAction(run, dispatch, 'approve')}
            onReject={onReject}
          />
        </Box>
        {run.stage === 'device' && (
          <ApprovalDirectionProvider direction={handshakeDirection}>
            <ApprovalOptionsProvider isSolo>
              <ApprovalLedgerSheet
                title="Check your Ledger"
                description="Simulated Ledger signing. No device is connected."
                isInteractive
                onDismiss={onReject}
              >
                <Stack
                  width="100%"
                  minHeight="0"
                  gap="space.04"
                  p="space.05"
                  justifyContent="space-between"
                >
                  <ApprovalLedgerDevice stage="device" />
                  <Stack gap="space.03">
                    <styled.p textStyle="caption.01" color="ink.text-subdued">
                      Demo device · simulate the decision you would make on your Ledger.
                    </styled.p>
                    <Button onClick={() => requestAction(run, dispatch, 'device-approved')}>
                      Approve on demo device
                    </Button>
                    <JourneyButton onClick={onReject}>Reject on demo device</JourneyButton>
                  </Stack>
                </Stack>
              </ApprovalLedgerSheet>
            </ApprovalOptionsProvider>
          </ApprovalDirectionProvider>
        )}
      </Box>
    );
  }
  if (
    run.stage === 'pending' ||
    run.stage === 'confirmed' ||
    run.stage === 'failed' ||
    run.stage === 'signed'
  ) {
    return (
      <JourneyOutcomeView
        definition={definition}
        step={step}
        state={run.stage}
        signer={run.signer}
        feePaid={run.feePaid}
        receiptId={run.requestId}
        onBack={onBack}
      />
    );
  }
  return (
    <Stack
      height="100%"
      justifyContent="center"
      alignItems="center"
      gap="space.05"
      p="space.06"
      textAlign="center"
    >
      <styled.h2 textStyle="heading.04">
        {run.stage === 'rejected' ? 'Request canceled' : 'Ready for the next request'}
      </styled.h2>
      <styled.p textStyle="body.02" color="ink.text-subdued">
        {run.stage === 'rejected'
          ? 'Nothing was signed or sent. No fee was paid. You can try again from the app.'
          : 'Return to the app to continue this journey.'}
      </styled.p>
      <JourneyButton onClick={onBack}>Back to app</JourneyButton>
    </Stack>
  );
}

function StageMessage({ run, step }: { run: JourneyRun; step: JourneyStep }) {
  const messages = {
    ready: 'Ready when you are',
    review: 'Review the request in Leather',
    device: 'Waiting for your Ledger',
    signed: 'Signature received · nothing broadcast',
    pending: 'Submitted · waiting for confirmation',
    confirmed: step.kind === 'connect' ? 'Wallet connected' : 'Confirmed',
    failed: run.feePaid
      ? 'The call failed · only the fee was paid'
      : 'Submission failed · no fee paid',
    rejected: 'Canceled in Leather · nothing sent',
  };
  return (
    <styled.p
      role="status"
      textStyle="label.02"
      color={run.stage === 'failed' ? 'red.action-primary-default' : 'ink.text-primary'}
    >
      {messages[run.stage]}
    </styled.p>
  );
}

interface JourneyActivityProps {
  definition: JourneyDefinition;
  run: JourneyRun;
  onOpen(receipt: JourneyTransaction): void;
}

function JourneyActivity({ definition, run, onOpen }: JourneyActivityProps) {
  return (
    <Stack gap="space.03" minWidth="0">
      <styled.h2 textStyle="heading.05">Activity</styled.h2>
      {run.transactions.length === 0 && (
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          Transactions appear here after submission. Connections and message signatures do not
          create transactions.
        </styled.p>
      )}
      {[...run.transactions].reverse().map(receipt => {
        const original = definition.steps[receipt.stepIndex];
        if (!original) return null;
        const step = effectiveStep(original, receipt.amounts);
        const summary = activityListSummary({
          state: receipt.status,
          balances: receiptBalances(step, receipt),
        });
        const indicator = receipt.status === 'confirmed' ? 'function' : receipt.status;
        return (
          <ListItemBox
            key={receipt.requestId}
            onClick={() => onOpen(receipt)}
            leading={
              <BlockchainActivityAvatarIcon
                avatar={{ kind: 'icon', icon: 'contract-call' }}
                indicator={<BlockchainActivityIndicatorIcon indicator={indicator} size={12} />}
              />
            }
            title={step.functionName ?? step.title}
            caption={`${receipt.status} · ${step.contractName ?? definition.appName}`}
            trailing={
              summary && (
                <styled.span
                  textStyle="label.02"
                  color={
                    summary.direction === 'in' ? 'green.action-primary-default' : 'ink.text-primary'
                  }
                >
                  {summary.amount}
                </styled.span>
              )
            }
            trailingCaption={summary?.caption}
          />
        );
      })}
    </Stack>
  );
}

interface JourneySiteProps extends WalletSurfaceProps {
  participant: boolean;
}

function JourneySite({ run, dispatch, definition, step, participant }: JourneySiteProps) {
  const [walletVisible, setWalletVisible] = useState(false);
  const [receipt, setReceipt] = useState<JourneyTransaction>();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(
    new URLSearchParams(window.location.search).get('controls') === 'hidden'
  );

  function toggleControls() {
    const hidden = !controlsHidden;
    setControlsHidden(hidden);
    const url = new URL(window.location.href);
    if (hidden) url.searchParams.set('controls', 'hidden');
    else url.searchParams.delete('controls');
    window.history.replaceState(window.history.state, '', url);
  }

  const [amount, setAmount] = useState(
    (run.amounts[step.id] ?? step.movements[0]?.amount ?? '').replaceAll(',', '')
  );
  const canRequest = run.stage === 'ready' || run.stage === 'rejected' || run.stage === 'failed';
  const isFinished = run.stepIndex >= definition.steps.length;
  const isSettled = run.stage === 'confirmed' || run.stage === 'signed';
  const balances = journeyBalances(definition, run);
  const firstMovement = step.movements[0];
  const amountEditable =
    firstMovement?.direction === 'out' &&
    step.kind !== 'sign' &&
    step.kind !== 'broadcast' &&
    definition.id !== 'bns-register';
  const recipientValid =
    step.recipient === undefined ||
    (step.chain === 'bitcoin'
      ? isValidBitcoinAddress(step.recipient)
      : isValidStacksAddress(step.recipient));
  const nameValid = step.name === undefined || /^[a-z0-9-]{3,37}\.btc$/.test(step.name);
  const available = balances.find(item => item.symbol === firstMovement?.symbol);
  const needed =
    Number((firstMovement?.amount ?? '0').replaceAll(',', '')) +
    (step.fee?.symbol === firstMovement?.symbol ? Number(step.fee?.amount) : 0);
  const insufficientBalance =
    firstMovement?.direction === 'out' &&
    available !== undefined &&
    needed > Number(available.amount.replaceAll(',', ''));

  useEffect(() => {
    if (!participant || run.stage !== 'pending') return;
    const timeout = window.setTimeout(() => requestAction(run, dispatch, 'confirm'), 1800);
    return () => window.clearTimeout(timeout);
  }, [participant, run, dispatch]);

  useEffect(() => {
    if (run.stage === 'confirmed' || run.stage === 'signed' || run.stage === 'pending') {
      setWalletVisible(false);
    }
  }, [run.stage]);

  function openWallet() {
    setWalletVisible(true);
  }

  function closeWallet() {
    if (run.stage === 'review' || run.stage === 'device') requestAction(run, dispatch, 'reject');
    setWalletVisible(false);
    setReceipt(undefined);
  }

  function request() {
    dispatch({
      type: 'request',
      runId: run.id,
      revision: run.revision,
      at: Date.now(),
      requestId: crypto.randomUUID(),
      kind: step.kind,
    });
    setReceipt(undefined);
    openWallet();
  }

  function changeAmount(value: string) {
    const normalized = value.replaceAll(',', '');
    setAmount(normalized);
    if (/^\d+(\.\d{0,8})?$/.test(normalized) && Number(normalized) > 0) {
      dispatch({
        type: 'configure',
        runId: run.id,
        revision: run.revision,
        at: Date.now(),
        amount: { stepId: step.id, value: normalized },
      });
    }
  }

  function fail(feePaid: boolean) {
    if (!run.requestId) return;
    dispatch({
      type: 'fail',
      runId: run.id,
      revision: run.revision,
      requestId: run.requestId,
      at: Date.now(),
      feePaid,
    });
  }

  function continueJourney() {
    requestAction(run, dispatch, 'continue');
    setWalletVisible(false);
  }

  const selectedReceiptStep = receipt && definition.steps[receipt.stepIndex];
  const showWallet = walletVisible || receipt !== undefined;
  return (
    <Stack
      data-journey-stage={run.stage}
      data-journey-complete={isFinished}
      data-journey-step={run.stepIndex}
      minHeight="100dvh"
      bg="ink.background-secondary"
      color="ink.text-primary"
      gap="0"
    >
      {!participant && (
        <Flex
          as="nav"
          aria-label="Approval prototype workbench"
          position="sticky"
          top="0"
          zIndex="10"
          bg="ink.background-primary"
          borderBottomWidth={1}
          borderColor="ink.border-default"
          alignItems="center"
          gap="space.03"
          px="space.04"
          py="space.02"
          minWidth="0"
        >
          <styled.a
            href={catalogReturnUrl(window.location.search)}
            textStyle="caption.01"
            whiteSpace="nowrap"
            textDecoration="underline"
          >
            ← Screens
          </styled.a>
          {controlsHidden ? (
            <Flex flex="1" justifyContent="flex-end">
              <JourneyButton onClick={toggleControls}>Show controls</JourneyButton>
            </Flex>
          ) : (
            <>
              <styled.select
                aria-label="Choose journey"
                value={run.journeyId}
                onChange={event => chooseJourney(event.target.value)}
                textStyle="caption.01"
                borderWidth={1}
                borderColor="ink.border-default"
                borderRadius="sm"
                p="space.02"
                flex="1"
                minWidth="0"
                maxWidth="340px"
              >
                {journeyDefinitions.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
                {journeyDefinitions.flatMap(
                  item =>
                    item.variants?.map(variant => (
                      <option key={`${item.id}:${variant.id}`} value={`${item.id}:${variant.id}`}>
                        {item.title} · {variant.label}
                      </option>
                    )) ?? []
                )}
              </styled.select>
              <styled.span
                textStyle="caption.02"
                color="ink.text-subdued"
                display={{ base: 'none', md: 'inline' }}
                flex="1"
              >
                {isFinished
                  ? 'Complete'
                  : `${run.stepIndex + 1}/${definition.steps.length} · ${step.title}`}
              </styled.span>
              <JourneyButton onClick={() => setControlsOpen(open => !open)}>
                {controlsOpen ? 'Close controls' : 'Controls'}
              </JourneyButton>
            </>
          )}
        </Flex>
      )}
      <Flex
        as="header"
        alignItems="center"
        justifyContent="space-between"
        gap="space.03"
        flexWrap="wrap"
        px={{ base: 'space.05', md: 'space.08' }}
        py="space.04"
        bg="ink.background-primary"
        borderBottomWidth={1}
        borderColor="ink.border-default"
      >
        <Stack gap="space.01">
          <styled.span textStyle="label.02">{definition.appName}</styled.span>
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Demo experience · no real funds
          </styled.span>
        </Stack>
        <Flex gap="space.03" alignItems="center" flexWrap="wrap">
          {run.connected && (
            <styled.span textStyle="caption.01">
              {run.signer === 'ledger' ? 'Account 2' : 'Account 1'} ·{' '}
              {run.signer === 'ledger' ? 'Ledger' : 'software'}
            </styled.span>
          )}
        </Flex>
      </Flex>
      {controlsOpen && !participant && !controlsHidden && (
        <Stack
          as="aside"
          aria-label="Review controls"
          gap="space.04"
          bg="ink.background-primary"
          borderBottomWidth={1}
          borderColor="ink.border-default"
          p="space.05"
        >
          <Flex gap="space.04" flexWrap="wrap" alignItems="center">
            <JourneyButton onClick={() => chooseJourney(run.journeyId)}>Restart</JourneyButton>
            <JourneyButton onClick={toggleControls}>Hide controls</JourneyButton>
            <JourneyButton onClick={() => exportJourney(run)}>Export session</JourneyButton>
            <styled.a
              href={testerUrl(window.location.search, run.journeyId)}
              target="_blank"
              rel="noreferrer"
              textStyle="caption.01"
              textDecoration="underline"
            >
              Open tester view ↗
            </styled.a>
            <styled.p textStyle="caption.02" color="ink.text-subdued">
              Tester view starts fresh in a new tab, without review controls.
            </styled.p>
          </Flex>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            Illustrative fixtures, not live app requests. Catalog and journeys use the same approval
            and outcome views. Session export contains demo actions and states; it is not a screen
            recording.
          </styled.p>
          <styled.details>
            <styled.summary textStyle="caption.01" cursor="pointer">
              Compare with current wallet reference
            </styled.summary>
            <Box mt="space.04">
              <JourneyReference step={step} />
            </Box>
          </styled.details>
        </Stack>
      )}
      <Grid
        columns={1}
        gap="space.07"
        p={{ base: 'space.05', md: 'space.08' }}
        width="100%"
        maxWidth="840px"
        mx="auto"
        alignItems="start"
      >
        <Stack gap="space.06" minWidth="0">
          <Stack
            bg="ink.background-primary"
            borderWidth={1}
            borderColor="ink.border-default"
            borderRadius="lg"
            p={{ base: 'space.05', md: 'space.07' }}
            gap="space.05"
          >
            <Stack gap="space.02">
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                {isFinished
                  ? 'All steps complete'
                  : `Step ${run.stepIndex + 1} of ${definition.steps.length}`}
              </styled.p>
              <styled.h1 textStyle="heading.03">
                {isFinished ? 'You’re all set' : step.title}
              </styled.h1>
              <styled.p textStyle="body.02" color="ink.text-subdued">
                {definition.description}
              </styled.p>
            </Stack>
            {isFinished ? (
              <styled.p role="status" textStyle="label.02">
                Journey complete
              </styled.p>
            ) : (
              <StageMessage run={run} step={step} />
            )}
            {!isFinished && canRequest && (
              <Stack gap="space.04">
                {step.recipient !== undefined && (
                  <styled.label textStyle="label.03">
                    Recipient
                    <styled.input
                      aria-label="Recipient"
                      value={step.recipient}
                      onChange={event =>
                        dispatch({
                          type: 'configure',
                          runId: run.id,
                          revision: run.revision,
                          at: Date.now(),
                          amount: { stepId: 'field:recipient', value: event.target.value },
                        })
                      }
                      display="block"
                      width="100%"
                      borderWidth={1}
                      borderColor="ink.border-default"
                      p="space.03"
                      mt="space.02"
                    />
                    {!recipientValid && (
                      <styled.span
                        role="alert"
                        color="red.action-primary-default"
                        textStyle="caption.01"
                      >
                        Enter a valid {step.chain === 'bitcoin' ? 'Bitcoin' : 'Stacks'} address.
                      </styled.span>
                    )}
                  </styled.label>
                )}
                {step.name !== undefined && (
                  <styled.label textStyle="label.03">
                    Name
                    <styled.input
                      aria-label="BNS name"
                      value={step.name}
                      readOnly={step.id === 'register'}
                      onChange={event =>
                        dispatch({
                          type: 'configure',
                          runId: run.id,
                          revision: run.revision,
                          at: Date.now(),
                          amount: { stepId: 'field:name', value: event.target.value.toLowerCase() },
                        })
                      }
                      display="block"
                      width="100%"
                      borderWidth={1}
                      borderColor="ink.border-default"
                      p="space.03"
                      mt="space.02"
                    />
                    {!nameValid && (
                      <styled.span
                        role="alert"
                        color="red.action-primary-default"
                        textStyle="caption.01"
                      >
                        Use a demo name such as fab-demo.btc.
                      </styled.span>
                    )}
                  </styled.label>
                )}
                {step.movements.length > 0 && (
                  <styled.label textStyle="label.03">
                    Amount ({step.movements[0]?.symbol})
                    <styled.input
                      aria-label="Amount"
                      inputMode="decimal"
                      readOnly={!amountEditable}
                      value={amount}
                      onChange={event => changeAmount(event.target.value)}
                      display="block"
                      width="100%"
                      borderWidth={1}
                      borderColor="ink.border-default"
                      borderRadius="sm"
                      p="space.04"
                      mt="space.02"
                      textStyle="heading.04"
                    />
                  </styled.label>
                )}
                <styled.label textStyle="caption.01">
                  Signing account{' '}
                  <styled.select
                    aria-label="Signing account"
                    value={run.signer}
                    onChange={event => {
                      if (event.target.value === 'ledger' || event.target.value === 'software')
                        dispatch({
                          type: 'configure',
                          runId: run.id,
                          revision: run.revision,
                          at: Date.now(),
                          signer: event.target.value,
                        });
                    }}
                    display="block"
                    width="100%"
                    borderWidth={1}
                    borderColor="ink.border-default"
                    p="space.03"
                    mt="space.02"
                  >
                    <option value="software">Account 1 · software</option>
                    <option value="ledger">Account 2 · Ledger</option>
                  </styled.select>
                </styled.label>
                <styled.p textStyle="caption.01" color="ink.text-subdued">
                  Expect {new URL(definition.origin).hostname} in the Leather review.
                </styled.p>
                {insufficientBalance && (
                  <styled.p role="alert" textStyle="caption.01" color="red.action-primary-default">
                    Not enough {firstMovement?.symbol} in the demo portfolio.
                  </styled.p>
                )}
                <Button
                  data-journey-request=""
                  size="lg"
                  fullWidth
                  onClick={request}
                  disabled={
                    !recipientValid ||
                    !nameValid ||
                    insufficientBalance ||
                    (step.movements.length > 0 &&
                      (!/^\d+(\.\d{0,8})?$/.test(amount.replaceAll(',', '')) ||
                        Number(amount.replaceAll(',', '')) <= 0))
                  }
                >
                  {step.kind === 'connect' ? 'Connect Leather' : `Continue in Leather`}
                </Button>
              </Stack>
            )}
            {(run.stage === 'review' || run.stage === 'device') && (
              <Stack gap="space.03">
                <styled.p textStyle="body.02">
                  Review the request in Leather. Canceling leaves this page ready to try again.
                </styled.p>
                <JourneyButton onClick={openWallet}>Open Leather</JourneyButton>
              </Stack>
            )}
            {run.stage === 'pending' && (
              <Stack gap="space.04">
                <styled.p textStyle="body.02">
                  {step.waits ?? 'Your request was submitted. It is not confirmed yet.'}
                </styled.p>
                {participant ? (
                  <styled.p textStyle="caption.01" color="ink.text-subdued">
                    Demo network · confirmation will appear shortly.
                  </styled.p>
                ) : (
                  <Box
                    borderWidth={1}
                    borderColor="ink.border-default"
                    borderRadius="sm"
                    p="space.04"
                  >
                    <styled.p textStyle="caption.02" color="ink.text-subdued">
                      Demo chain controls · advance the wait
                    </styled.p>
                    <Flex gap="space.02" flexWrap="wrap" mt="space.03">
                      <JourneyButton onClick={() => requestAction(run, dispatch, 'confirm')}>
                        Confirm transaction
                      </JourneyButton>
                      {step.chain === 'stacks' && (
                        <JourneyButton onClick={() => fail(true)}>
                          Fail on chain · fee paid
                        </JourneyButton>
                      )}
                      <JourneyButton onClick={() => fail(false)}>
                        Fail submission · no fee
                      </JourneyButton>
                    </Flex>
                  </Box>
                )}
              </Stack>
            )}
            {isSettled && !isFinished && (
              <Stack gap="space.03">
                <styled.p textStyle="body.02">
                  {step.kind === 'connect'
                    ? 'You can now continue in the app. Spending still needs a separate approval.'
                    : step.note}
                </styled.p>
                <Button data-journey-request="" onClick={continueJourney}>
                  {run.stepIndex + 1 < definition.steps.length
                    ? `Continue: ${definition.steps[run.stepIndex + 1]?.title}`
                    : 'Finish journey'}
                </Button>
              </Stack>
            )}
            {isFinished && (
              <JourneyButton onClick={() => chooseJourney(run.journeyId)}>
                Try again from the start
              </JourneyButton>
            )}
          </Stack>
          <Stack
            bg="ink.background-primary"
            borderWidth={1}
            borderColor="ink.border-default"
            borderRadius="lg"
            p="space.05"
            gap="space.05"
          >
            <Stack gap="space.03">
              <styled.h2 textStyle="heading.05">Leather · demo portfolio</styled.h2>
              <Grid columns={2} gap="space.03">
                {balances.map(balance => (
                  <Stack key={balance.symbol} gap="space.01">
                    <styled.span textStyle="caption.02" color="ink.text-subdued">
                      {balance.symbol}
                    </styled.span>
                    <styled.span textStyle="label.02" overflowWrap="anywhere">
                      {balance.amount}
                    </styled.span>
                  </Stack>
                ))}
              </Grid>
              <styled.p textStyle="caption.02" color="ink.text-subdued">
                Illustrative balances. Only confirmed movements and charged fees change them.
              </styled.p>
            </Stack>
            <JourneyActivity
              definition={definition}
              run={run}
              onOpen={item => {
                setReceipt(item);
                setWalletVisible(true);
              }}
            />
          </Stack>
          {!participant && (
            <styled.details>
              <styled.summary textStyle="caption.01" cursor="pointer">
                Session events ({run.events.length})
              </styled.summary>
              <Stack gap="space.02" mt="space.03">
                {run.events.map(event => (
                  <styled.p key={event.id} textStyle="caption.02">
                    {new Date(event.at).toLocaleTimeString()} · {event.label}
                  </styled.p>
                ))}
              </Stack>
            </styled.details>
          )}
        </Stack>
      </Grid>
      {showWallet && (
        <JourneyWalletPopover onClose={closeWallet}>
          {receipt && selectedReceiptStep ? (
            <JourneyOutcomeView
              definition={definition}
              step={effectiveStep(selectedReceiptStep, receipt.amounts)}
              state={receipt.status}
              signer={run.signer}
              feePaid={receipt.feePaid}
              receiptId={receipt.requestId}
              onBack={closeWallet}
            />
          ) : (
            <JourneyWalletSurface
              run={run}
              dispatch={dispatch}
              definition={definition}
              step={step}
              onBack={closeWallet}
            />
          )}
        </JourneyWalletPopover>
      )}
      <styled.footer
        textStyle="caption.02"
        color="ink.text-subdued"
        textAlign="center"
        p="space.05"
      >
        Browser simulation · shared Leather views · no wallet extension, device or network
        transaction is used.
      </styled.footer>
    </Stack>
  );
}

function JourneyAppContent() {
  const params = new URLSearchParams(window.location.search);
  const runId = params.get('run') ?? '';
  const { run, dispatch } = useJourneyRun(runId);
  const definition = resolveJourney(run?.journeyId ?? params.get('journey') ?? '');
  const isWallet = params.get('surface') === 'wallet';
  const requestedJourney = params.get('journey') ?? 'connect';
  useEffect(() => {
    if (run || isWallet) return;
    const fresh = startJourney(resolveJourney(requestedJourney) ? requestedJourney : 'connect');
    const next = new URL(window.location.href);
    next.searchParams.set('journey', fresh.journeyId);
    next.searchParams.set('run', fresh.id);
    window.location.replace(next.toString());
  }, [run, isWallet, requestedJourney]);
  const originalStep =
    run && definition?.steps[Math.min(run.stepIndex, definition.steps.length - 1)];
  if (!run || !definition || !originalStep) {
    return (
      <Stack
        minHeight="100dvh"
        p={{ base: 'space.05', md: 'space.08' }}
        gap="space.07"
        maxWidth="1100px"
        mx="auto"
      >
        <Stack gap="space.03">
          <styled.a
            href={catalogReturnUrl(window.location.search)}
            textStyle="caption.01"
            textDecoration="underline"
          >
            Back to catalog
          </styled.a>
          <styled.h1 textStyle="heading.04">
            {isWallet ? 'Session unavailable' : 'Opening prototype…'}
          </styled.h1>
          {isWallet && (
            <styled.a href={prototypeUrl(window.location.search, 'connect')}>
              Launch prototype
            </styled.a>
          )}
        </Stack>
      </Stack>
    );
  }
  const step = effectiveStep(originalStep, run.amounts);
  if (isWallet)
    return (
      <Box height="100dvh" bg="ink.background-primary" color="ink.text-primary">
        <JourneyWalletSurface
          run={run}
          dispatch={dispatch}
          definition={definition}
          step={step}
          onBack={() => {
            if (window.opener) window.close();
            else window.location.assign(journeyUrl(run));
          }}
        />
      </Box>
    );
  return (
    <JourneySite
      key={`${run.id}:${run.stepIndex}`}
      run={run}
      dispatch={dispatch}
      definition={definition}
      step={step}
      participant={params.get('mode') === 'participant'}
      onBack={() => undefined}
    />
  );
}

export function JourneyApp() {
  return (
    <>
      <style>{'[data-playground-dock] { display: none; }'}</style>
      <JourneyAppContent />
    </>
  );
}
