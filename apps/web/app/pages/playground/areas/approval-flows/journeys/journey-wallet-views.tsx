import type { ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  BtcAvatarIcon,
  Button,
  PlaceholderIcon,
  SbtcAvatarIcon,
  StxAvatarIcon,
  UsdcxAvatarIcon,
} from '@leather.io/ui';

import { handshakeDirection } from '../directions/handshake-direction';
import { ApprovalDirectionProvider } from '../pattern/approval-direction';
import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import {
  ApprovalHistoryHeader,
  ApprovalHistoryShell,
  ApprovalHistoryStatus,
} from '../pattern/approval-history';
import { ApprovalAccountPicker } from '../pattern/approval-identity';
import { ApprovalNote, ApprovalPermission } from '../pattern/approval-notices';
import { ApprovalOptionsProvider } from '../pattern/approval-options';
import {
  ApprovalAssetRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import type { ApprovalAccount, ApprovalRequester } from '../pattern/approval-types';
import { account1, btcAccount1, ledgerAccount, mainnet, vaultAccount } from '../scenarios/fixtures';
import type { JourneyDefinition, JourneyStep } from './journey-types';

interface JourneyViewProviderProps {
  children: ReactNode;
  isConnect?: boolean;
  hasLaunch?: boolean;
}

function JourneyViewProvider({
  children,
  isConnect = false,
  hasLaunch = false,
}: JourneyViewProviderProps) {
  return (
    <ApprovalDirectionProvider direction={handshakeDirection}>
      <ApprovalOptionsProvider
        titleStyle="current"
        containers="interactive"
        isSolo
        isConnect={isConnect}
        hasLaunch={hasLaunch}
      >
        {children}
      </ApprovalOptionsProvider>
    </ApprovalDirectionProvider>
  );
}

function journeyAccount(
  definition: JourneyDefinition,
  step: JourneyStep,
  signer: JourneyApprovalViewProps['signer']
): ApprovalAccount {
  const account = signer === 'ledger' ? ledgerAccount : account1;
  const scopedAccount =
    definition.category === 'vaults' ? { ...account, vault: vaultAccount.vault } : account;
  if (step.chain === 'bitcoin') return { ...scopedAccount, address: btcAccount1.nativeSegwit };
  return scopedAccount;
}

function journeyRequester(definition: JourneyDefinition, isConnect = false): ApprovalRequester {
  return {
    origin: definition.origin,
    connection: isConnect ? 'not-connected' : 'connected',
  };
}

function assetIcon(symbol: string) {
  switch (symbol) {
    case 'BTC':
      return <BtcAvatarIcon size="md" />;
    case 'STX':
      return <StxAvatarIcon size="md" />;
    case 'sBTC':
      return <SbtcAvatarIcon size="md" />;
    case 'USDCx':
      return <UsdcxAvatarIcon size="md" />;
    default:
      return <PlaceholderIcon />;
  }
}

interface JourneyMovementRowsProps {
  step: JourneyStep;
  isOutcome?: boolean;
}

function movementLabel(direction: 'in' | 'out' | 'neutral', isOutcome: boolean) {
  if (direction === 'in') return isOutcome ? 'You received' : 'You receive';
  if (direction === 'out') return isOutcome ? 'You sent' : 'You send';
  return isOutcome ? 'Changed' : 'Involved';
}

function JourneyMovementRows({ step, isOutcome = false }: JourneyMovementRowsProps) {
  return (
    <>
      {step.movements.map((movement, index) => (
        <ApprovalAssetRow
          key={`${movement.symbol}-${movement.direction}-${index}`}
          icon={assetIcon(movement.symbol)}
          label={
            step.kind === 'proposal' || step.kind === 'sign'
              ? 'If broadcast'
              : movementLabel(movement.direction, isOutcome)
          }
          amount={<ExactAmount value={movement.amount} symbol={movement.symbol} />}
          fiat={movement.fiat}
          direction={movement.direction}
        />
      ))}
    </>
  );
}

interface JourneyRequestFactsProps {
  definition: JourneyDefinition;
  step: JourneyStep;
  account: ApprovalAccount;
}

function JourneyRequestFacts({ definition, step, account }: JourneyRequestFactsProps) {
  if (step.kind === 'connect') {
    return (
      <>
        <ApprovalSection label="Account">
          <ApprovalAccountPicker account={account} bitcoinAddress={btcAccount1.nativeSegwit} />
        </ApprovalSection>
        <ApprovalSection label="This site will be able to" divided>
          <ApprovalPermission>See your addresses and balances</ApprovalPermission>
          <ApprovalPermission>Ask you to approve transactions and sign messages</ApprovalPermission>
          <ApprovalPermission kind="cannot">
            It can’t move funds or sign anything without asking you first
          </ApprovalPermission>
        </ApprovalSection>
      </>
    );
  }
  return (
    <>
      {step.message && (
        <ApprovalSection label="Message">
          <ApprovalRow label="Requested by" value={definition.origin} />
          <ApprovalRow label="Message to sign" value={step.message} />
        </ApprovalSection>
      )}
      {step.recipient && (
        <ApprovalSection label="Recipient">
          <ApprovalRecipientRow address={<AddressDisplayer address={step.recipient} />} />
        </ApprovalSection>
      )}
      {step.name && (
        <ApprovalSection label="Name">
          <ApprovalRow label="Register to your account" value={step.name} />
        </ApprovalSection>
      )}
      {step.movements.length > 0 && (
        <ApprovalSection label="What moves">
          <JourneyMovementRows step={step} />
        </ApprovalSection>
      )}
      {step.fee && (
        <ApprovalSection label="Fee">
          <ApprovalFeeRow
            label={step.kind === 'proposal' || step.kind === 'sign' ? 'Fee if broadcast' : 'Fee'}
            amount={<ExactAmount value={step.fee.amount} symbol={step.fee.symbol} />}
          />
        </ApprovalSection>
      )}
      {step.protection && (
        <ApprovalSection label={step.kind === 'message' ? 'What signing means' : 'Spending limits'}>
          <ApprovalNote>{step.protection}</ApprovalNote>
        </ApprovalSection>
      )}
      {step.note && (
        <ApprovalSection label="Before you continue">
          <ApprovalNote>{step.note}</ApprovalNote>
        </ApprovalSection>
      )}
      <ApprovalSection label="Details" divided collapsible summary="Method and contract">
        <ApprovalRow
          label="Method"
          value={<ApprovalIdentifier>{step.method}</ApprovalIdentifier>}
        />
        {step.functionName && (
          <ApprovalRow
            label="Function"
            value={<ApprovalIdentifier>{step.functionName}</ApprovalIdentifier>}
          />
        )}
        {step.contractName && <ApprovalRow label="Contract" value={step.contractName} />}
        <ApprovalRow label="Data" value="Illustrative demo fixture" />
      </ApprovalSection>
    </>
  );
}

interface JourneyApprovalViewProps {
  definition: JourneyDefinition;
  step: JourneyStep;
  signer: 'software' | 'ledger';
  onApprove?(): void;
  onReject?(): void;
}

export function JourneyApprovalView({
  definition,
  step,
  signer,
  onApprove,
  onReject,
}: JourneyApprovalViewProps) {
  const account = journeyAccount(definition, step, signer);
  const isConnect = step.kind === 'connect';
  const footerMovement =
    step.movements.find(movement => movement.direction === 'out') ??
    step.movements.find(movement => movement.direction === 'in');
  const isDeferredTransfer = step.kind === 'proposal' || step.kind === 'sign';
  const footerLabel = isDeferredTransfer
    ? 'If broadcast'
    : movementLabel(footerMovement?.direction ?? 'out', false);
  const isSignature = step.kind !== 'connect' && step.kind !== 'broadcast';
  const primaryLabel = signer === 'ledger' && isSignature ? 'Sign on Ledger' : step.primaryLabel;
  return (
    <JourneyViewProvider isConnect={isConnect} hasLaunch={onApprove !== undefined}>
      <ApprovalShell
        footer={
          <ApprovalFooter
            primaryLabel={primaryLabel}
            primaryIntent={definition.id === 'generic-unrestricted' ? 'danger' : 'default'}
            confirmation={
              definition.id === 'generic-unrestricted'
                ? {
                    mode: 'acknowledge',
                    statement: 'I understand there is no enforced spending limit',
                  }
                : undefined
            }
            total={
              footerMovement
                ? {
                    label: footerLabel,
                    amount: (
                      <ExactAmount value={footerMovement.amount} symbol={footerMovement.symbol} />
                    ),
                    fiat: footerMovement.fiat,
                  }
                : undefined
            }
            secondaryTotal={
              step.fee
                ? {
                    label: isDeferredTransfer ? 'Fee if broadcast' : 'Fee',
                    amount: <ExactAmount value={step.fee.amount} symbol={step.fee.symbol} />,
                  }
                : undefined
            }
            onPrimaryClick={onApprove}
            onSecondaryClick={onReject}
          />
        }
      >
        <ApprovalHeader
          requester={journeyRequester(definition, isConnect)}
          account={isConnect ? undefined : account}
          connecting={isConnect ? account : undefined}
          network={mainnet}
        />
        <ApprovalIntent title={step.title} />
        <JourneyRequestFacts definition={definition} step={step} account={account} />
      </ApprovalShell>
    </JourneyViewProvider>
  );
}

interface JourneyOutcomeViewProps {
  definition: JourneyDefinition;
  step: JourneyStep;
  state: 'pending' | 'confirmed' | 'failed' | 'signed';
  onBack?(): void;
  signer?: 'software' | 'ledger';
  feePaid?: boolean;
  receiptId?: string;
}

function outcomeTitle(state: JourneyOutcomeViewProps['state']) {
  if (state === 'signed') return 'Signed · not broadcast';
  if (state === 'pending') return 'Transaction sent';
  if (state === 'failed') return 'Transaction failed';
  return 'Transaction confirmed';
}

function outcomeNote(step: JourneyStep, state: JourneyOutcomeViewProps['state'], feePaid: boolean) {
  if (state === 'signed')
    return (
      step.waits ?? 'The signature is ready. Nothing has been broadcast and no fee has been paid.'
    );
  if (state === 'pending')
    return 'Waiting for confirmation. The balance changes are not final yet.';
  if (state === 'failed') {
    if (!feePaid)
      return 'The request stopped before broadcast. No assets moved and no fee was paid.';
    return 'The call stopped. Only the fee was paid; the requested transfers did not happen.';
  }
  return 'These are the actual movements in this demo, after confirmation.';
}

export function JourneyOutcomeView({
  definition,
  step,
  state,
  onBack,
  signer = 'software',
  feePaid = true,
  receiptId,
}: JourneyOutcomeViewProps) {
  const account = journeyAccount(definition, step, signer);
  const historyState = state === 'signed' ? 'pending' : state;
  const signatureLabel = state === 'signed' ? 'Signed · not broadcast' : undefined;
  return (
    <JourneyViewProvider>
      <ApprovalHistoryShell
        state={historyState}
        footer={
          <Box p="space.05">
            <Button fullWidth size="lg" onClick={onBack}>
              Back to app
            </Button>
          </Box>
        }
      >
        <ApprovalHistoryHeader account={account} onBack={onBack} />
        <ApprovalHistoryStatus
          title={
            step.kind === 'connect' ? `Connected to ${definition.appName}` : outcomeTitle(state)
          }
          date="Just now · demo"
          requester={journeyRequester(definition)}
          statusLabel={step.kind === 'connect' ? 'Connected' : signatureLabel}
          note={
            step.kind === 'connect'
              ? 'Public account information was shared. Nothing was signed or sent.'
              : outcomeNote(step, state, feePaid)
          }
        />
        {state === 'confirmed' && step.kind !== 'connect' && (
          <ApprovalSection label="What moved">
            <JourneyMovementRows
              step={{ ...step, movements: step.outcomeMovements ?? step.movements }}
              isOutcome
            />
          </ApprovalSection>
        )}
        {(state === 'confirmed' || (state === 'failed' && feePaid)) && step.fee && (
          <ApprovalSection label="Fee paid">
            <ApprovalFeeRow
              label="Fee paid"
              amount={<ExactAmount value={step.fee.amount} symbol={step.fee.symbol} />}
            />
          </ApprovalSection>
        )}
        <ApprovalSection label="Details" divided>
          <ApprovalRow label="Account" value={account.vault?.name ?? account.name} />
          {account.vault && <ApprovalRow label="Signed by" value={account.name} />}
          {step.recipient && (
            <ApprovalRecipientRow address={<AddressDisplayer address={step.recipient} />} />
          )}
          {step.name && <ApprovalRow label="Name" value={step.name} />}
          <ApprovalRow label="Action" value={step.title} />
          <ApprovalRow label="App" value={definition.appName} />
          {receiptId && (step.kind === 'transaction' || step.kind === 'broadcast') && (
            <ApprovalRow
              label="Demo receipt"
              value={<ApprovalIdentifier>{receiptId}</ApprovalIdentifier>}
            />
          )}
          <ApprovalRow label="Data" value="Illustrative demo fixture" />
        </ApprovalSection>
      </ApprovalHistoryShell>
    </JourneyViewProvider>
  );
}
