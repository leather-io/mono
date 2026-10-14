import { type ReactNode, useEffect, useState } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { formatCryptoPrecise, formatCurrency } from '~/utils/currency-formatter';

import {
  Avatar,
  Badge,
  Button,
  Callout,
  CheckmarkCircleIcon,
  CheckmarkIcon,
  ChevronDownIcon,
  CircleIcon,
  CloseIcon,
  Flag,
  GiftIcon,
  LockIcon,
  SbtcAvatarIcon,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import {
  AddressValue,
  ExtensionFrame,
  FlowBoard,
  InfoRow,
  MockSection,
  type MockTxStatus,
  SponsoredBadge,
  Timeline,
  type TimelineStep,
  TxStatusBadge,
} from './extension-frame';
import {
  type FeeTier,
  contractCallBundleStxFeeMicro,
  feeTierLabels,
  feeTierTimes,
  feeTiers,
  formatStxFee,
  getFeeSatsByTier,
  microStx,
  mockAccount,
  mockContractCall,
  mockQuote,
  mockTxids,
  sats,
  satsToUsd,
} from './sponsorship-mock-data';

type SponsoredContractCallSigner = 'software' | 'ledger';

type ApprovalStep =
  | 'request'
  | 'ledger-connect'
  | 'ledger-sign-fee'
  | 'ledger-sign-call'
  | 'submitting'
  | 'submitted';

type LedgerApproval = 'awaiting' | 'approved';

type BundleTransactionKey = 'fee' | 'call';

const submitDelayMs = 1200;
const ledgerApprovedDelayMs = 900;
const feePaymentConfirmDelayMs = 3500;
const contractCallConfirmDelayMs = 6000;
const feePaymentNonce = mockAccount.nextNonce;
const contractCallNonce = mockAccount.nextNonce + 1;
const sbtcTokenContract = {
  address: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
  name: 'sbtc-token',
  functionName: 'transfer-many',
};

const ledgerSteps: ApprovalStep[] = ['ledger-connect', 'ledger-sign-fee', 'ledger-sign-call'];

function isLedgerStep(step: ApprovalStep) {
  return ledgerSteps.includes(step);
}

function getSoftwareTimelineIndex(step: ApprovalStep, contractCallStatus: MockTxStatus) {
  if (step === 'request') return 1;
  if (step === 'submitting') return 5;
  if (step === 'submitted') return contractCallStatus === 'confirmed' ? 7 : 6;
  return 4;
}

function getLedgerTimelineIndex(step: ApprovalStep, contractCallStatus: MockTxStatus) {
  if (step === 'request') return 1;
  if (step === 'ledger-connect' || step === 'ledger-sign-fee') return 4;
  if (step === 'ledger-sign-call') return 5;
  if (step === 'submitting') return 6;
  return contractCallStatus === 'confirmed' ? 8 : 7;
}

interface MockTransactionCardProps {
  index: number;
  title: string;
  description: string;
  nonce: number;
  txid: string;
  status: MockTxStatus;
}
function MockTransactionCard({
  index,
  title,
  description,
  nonce,
  txid,
  status,
}: MockTransactionCardProps) {
  return (
    <Stack
      gap="space.02"
      p="space.04"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
    >
      <HStack justifyContent="space-between" alignItems="start">
        <HStack gap="space.02" alignItems="start">
          <styled.span textStyle="label.02" color="ink.text-subdued">
            {index}
          </styled.span>
          <Stack gap="space.00">
            <styled.span textStyle="label.02">{title}</styled.span>
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {description}
            </styled.span>
          </Stack>
        </HStack>
        <TxStatusBadge status={status} />
      </HStack>
      <HStack justifyContent="space-between">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Nonce {nonce}
        </styled.span>
        <styled.span textStyle="caption.01" fontFamily="monospace" color="ink.text-subdued">
          {truncateMiddle(txid, 6)}
        </styled.span>
      </HStack>
    </Stack>
  );
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
}
function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack gap="space.01">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      {typeof value === 'string' ? <styled.span textStyle="label.01">{value}</styled.span> : value}
    </Stack>
  );
}

interface BundleTransactionProps {
  index: number;
  title: string;
  caption: string;
  amount: string;
  nonce: number;
  isLast?: boolean;
  isExpanded: boolean;
  onToggle(): void;
  children: ReactNode;
}
function BundleTransaction({
  index,
  title,
  caption,
  amount,
  nonce,
  isLast = false,
  isExpanded,
  onToggle,
  children,
}: BundleTransactionProps) {
  return (
    <HStack gap="space.03" alignItems="stretch">
      <Stack gap="space.01" alignItems="center" flexShrink={0} width="24px">
        <Flex
          alignItems="center"
          justifyContent="center"
          width="24px"
          height="24px"
          flexShrink={0}
          borderRadius="round"
          bg="ink.text-primary"
          color="ink.background-primary"
          textStyle="label.03"
        >
          {index}
        </Flex>
        {!isLast && <Box flex={1} width="1px" bg="ink.border-default" />}
      </Stack>
      <Stack gap="space.02" flex={1} minWidth={0} pb={isLast ? 'space.00' : 'space.04'}>
        <styled.button
          type="button"
          width="100%"
          textAlign="left"
          cursor="pointer"
          onClick={onToggle}
        >
          <HStack justifyContent="space-between" alignItems="start" gap="space.03">
            <Stack gap="space.00" minWidth={0}>
              <styled.span textStyle="label.02">{title}</styled.span>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {caption}
              </styled.span>
            </Stack>
            <HStack gap="space.02" flexShrink={0}>
              <Stack gap="space.00" alignItems="end">
                <styled.span textStyle="label.02">{amount}</styled.span>
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  Nonce {nonce}
                </styled.span>
              </Stack>
              <Box display="flex" transform={isExpanded ? 'rotate(180deg)' : undefined}>
                <ChevronDownIcon variant="small" />
              </Box>
            </HStack>
          </HStack>
        </styled.button>
        {isExpanded && (
          <Stack gap="space.03" p="space.03" bg="ink.background-secondary" borderRadius="sm">
            {children}
          </Stack>
        )}
      </Stack>
    </HStack>
  );
}

interface LedgerSheetProps {
  onClose(): void;
  children: ReactNode;
}
function LedgerSheet({ onClose, children }: LedgerSheetProps) {
  return (
    <Stack gap="space.04">
      <HStack justifyContent="space-between">
        <styled.span textStyle="heading.05">Ledger</styled.span>
        <styled.button type="button" onClick={onClose} cursor="pointer" display="flex">
          <CloseIcon color="ink.text-subdued" />
        </styled.button>
      </HStack>
      {children}
    </Stack>
  );
}

interface LedgerConnectStepProps {
  onConnect(): void;
}
function LedgerConnectStep({ onConnect }: LedgerConnectStepProps) {
  return (
    <Stack gap="space.05" alignItems="center" textAlign="center">
      <Avatar size="xl" icon={<LockIcon />} />
      <styled.span textStyle="heading.05" px="space.04">
        Plug in your Ledger, open the Stacks app and click connect
      </styled.span>
      <Stack gap="space.01" alignSelf="stretch" textAlign="left">
        <styled.span textStyle="body.01">1. Connect & unlock your Ledger</styled.span>
        <styled.span textStyle="body.01">2. Open Stacks app</styled.span>
        <styled.span textStyle="body.01">3. Click the button below</styled.span>
      </Stack>
      <Button fullWidth onClick={onConnect}>
        Connect Stacks
      </Button>
    </Stack>
  );
}

interface LedgerSignStepProps {
  index: number;
  total: number;
  label: string;
  details: [string, string][];
  approval: LedgerApproval;
  onApproveOnDevice(): void;
}
function LedgerSignStep({
  index,
  total,
  label,
  details,
  approval,
  onApproveOnDevice,
}: LedgerSignStepProps) {
  return (
    <Stack gap="space.04" alignItems="center" textAlign="center">
      <Badge label={`Transaction ${index} of ${total} · ${label}`} variant="info" />
      <styled.span textStyle="heading.05" px="space.04">
        Verify the transaction details on your Ledger
      </styled.span>
      {approval === 'awaiting' ? (
        <HStack gap="space.02" color="ink.text-subdued">
          <CircleIcon variant="small" color="blue.action-primary-default" />
          <styled.span textStyle="label.02">Waiting for your approval</styled.span>
        </HStack>
      ) : (
        <HStack gap="space.02" color="green.action-primary-default">
          <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />
          <styled.span textStyle="label.02">Approved</styled.span>
        </HStack>
      )}
      <Stack
        gap="space.03"
        width="100%"
        bg="ink.background-secondary"
        borderRadius="lg"
        p="space.04"
        textAlign="left"
      >
        {details.map(([title, value]) => (
          <Stack key={title} gap="space.01">
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {title}
            </styled.span>
            <styled.span textStyle="label.01" fontFamily="monospace" wordBreak="break-all">
              {value}
            </styled.span>
          </Stack>
        ))}
      </Stack>
      {approval === 'awaiting' && (
        <Button fullWidth variant="outline" onClick={onApproveOnDevice}>
          Approve on device (simulated)
        </Button>
      )}
    </Stack>
  );
}

interface SponsoredContractCallFlowProps {
  signer?: SponsoredContractCallSigner;
}
export function SponsoredContractCallFlow({ signer = 'software' }: SponsoredContractCallFlowProps) {
  const [step, setStep] = useState<ApprovalStep>('request');
  const [tier, setTier] = useState<FeeTier>('standard');
  const [isFeePickerOpen, setIsFeePickerOpen] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<BundleTransactionKey | null>(
    'call'
  );
  const [ledgerApproval, setLedgerApproval] = useState<LedgerApproval>('awaiting');
  const [feePaymentStatus, setFeePaymentStatus] = useState<MockTxStatus>('pending');
  const [contractCallStatus, setContractCallStatus] = useState<MockTxStatus>('queued');

  const isLedger = signer === 'ledger';
  const feeSatsByTier = getFeeSatsByTier(contractCallBundleStxFeeMicro, mockQuote);
  const feeSats = feeSatsByTier[tier];
  const amountSats = mockContractCall.amountSats;
  const totalSats = amountSats + feeSats;
  const isAwaitingSponsor = step === 'submitting';

  useEffect(() => {
    if (step !== 'submitting') return;
    const timer = setTimeout(() => setStep('submitted'), submitDelayMs);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (ledgerApproval !== 'approved') return;
    const timer = setTimeout(() => {
      setLedgerApproval('awaiting');
      if (step === 'ledger-sign-fee') setStep('ledger-sign-call');
      if (step === 'ledger-sign-call') setStep('submitting');
    }, ledgerApprovedDelayMs);
    return () => clearTimeout(timer);
  }, [ledgerApproval, step]);

  useEffect(() => {
    if (step !== 'submitted') return;
    const feePaymentTimer = setTimeout(() => {
      setFeePaymentStatus('confirmed');
      setContractCallStatus('pending');
    }, feePaymentConfirmDelayMs);
    const contractCallTimer = setTimeout(
      () => setContractCallStatus('confirmed'),
      contractCallConfirmDelayMs
    );
    return () => {
      clearTimeout(feePaymentTimer);
      clearTimeout(contractCallTimer);
    };
  }, [step]);

  function reset() {
    setStep('request');
    setTier('standard');
    setIsFeePickerOpen(false);
    setExpandedTransaction('call');
    setLedgerApproval('awaiting');
    setFeePaymentStatus('pending');
    setContractCallStatus('queued');
  }

  function onApprove() {
    setStep(isLedger ? 'ledger-connect' : 'submitting');
  }

  function toggleTransaction(key: BundleTransactionKey) {
    setExpandedTransaction(current => (current === key ? null : key));
  }

  const feePaymentLedgerDetails: [string, string][] = [
    ['Origin', mockAccount.address],
    ['Nonce', String(feePaymentNonce)],
    ['Fee (µSTX)', '0'],
    ['Contract address', sbtcTokenContract.address],
    ['Contract name', sbtcTokenContract.name],
    ['Function name', sbtcTokenContract.functionName],
    [
      'Argument 0',
      `(list (tuple (amount u${feeSats}) (sender ${mockAccount.address}) (to ${mockQuote.feeRecipientPrincipal}) (memo none)))`,
    ],
  ];

  const contractCallLedgerDetails: [string, string][] = [
    ['Origin', mockAccount.address],
    ['Nonce', String(contractCallNonce)],
    ['Fee (µSTX)', '0'],
    ['Contract address', mockContractCall.contractAddress],
    ['Contract name', mockContractCall.contractName],
    ['Function name', mockContractCall.functionName],
    ...mockContractCall.args.map((arg, index): [string, string] => [
      `Argument ${index}`,
      arg.value,
    ]),
  ];

  const signingSteps: TimelineStep[] = isLedger
    ? [
        {
          label: 'Sign tx 1 on the Ledger',
          detail: `The Stacks app shows the origin, nonce ${feePaymentNonce}, fee 0 and the ${sbtcTokenContract.name}.${sbtcTokenContract.functionName} fee entry. The user approves on the device and the signature goes into tx 1's origin spending condition.`,
        },
        {
          label: 'Sign tx 2 on the Ledger',
          detail: `A second device approval for the call itself: nonce ${contractCallNonce}, fee 0, ${mockContractCall.contractName}.${mockContractCall.functionName} and its arguments. Nothing is submitted until both signatures exist, so rejecting here discards tx 1 as well.`,
        },
      ]
    : [
        {
          label: 'Sign both as origin',
          detail:
            'The wallet signs tx 1 and tx 2 in one approval (single-sig here; multisig origins sign over time with a signerCount-priced quote).',
        },
      ];

  const steps: TimelineStep[] = [
    {
      label: 'Quote',
      detail: `POST /quote with the hash of the call payload. The service screens the origin, prices the STX fee for both transactions on the real payload and answers a quoteId bound to that hash: ${mockQuote.satsPerStx} sats per STX, ${mockQuote.minFeeSats}–${mockQuote.maxFeeSats.toLocaleString()} sats, ${mockQuote.ttlMinutes}-minute expiry.`,
    },
    {
      label: 'Pick a fee',
      detail: `One sBTC fee covers both transactions: ${formatStxFee(contractCallBundleStxFeeMicro[tier])} × ${mockQuote.satsPerStx} sats/STX = ${feeSats} sats. Same Low, Standard and High tiers as any other call.`,
    },
    {
      label: `Build tx 1 at nonce ${feePaymentNonce}`,
      detail: `A sponsored sbtc-token transfer-many with one fee entry: ${feeSats} sats to the sponsor's fee recipient. It pays first, so the sponsor is covered even if the call aborts.`,
    },
    {
      label: `Build tx 2 at nonce ${contractCallNonce}`,
      detail: `The contract call itself, ${mockContractCall.contractName}.${mockContractCall.functionName}, with sponsored auth and origin fee 0. Its payload hash must match the quote.`,
    },
    ...signingSteps,
    {
      label: 'Submit',
      detail:
        'POST /submit with the quoteId and both transactions. The service verifies the fee entry against the quote and tx 2 against the payload hash, screens again and reserves two consecutive sponsor nonces.',
    },
    {
      label: 'Broadcast tx 1, then tx 2',
      detail:
        'Both txids come back. Tx 2 can only mine after tx 1, and the service rebroadcasts it if it is dropped. The user pays the fee even if the call aborts, like gas.',
    },
  ];

  const timelineIndex = isLedger
    ? getLedgerTimelineIndex(step, contractCallStatus)
    : getSoftwareTimelineIndex(step, contractCallStatus);

  const ledgerOverlay = isLedgerStep(step) ? (
    <LedgerSheet onClose={() => setStep('request')}>
      {step === 'ledger-connect' && (
        <LedgerConnectStep onConnect={() => setStep('ledger-sign-fee')} />
      )}
      {step === 'ledger-sign-fee' && (
        <LedgerSignStep
          index={1}
          total={2}
          label="Fee payment"
          details={feePaymentLedgerDetails}
          approval={ledgerApproval}
          onApproveOnDevice={() => setLedgerApproval('approved')}
        />
      )}
      {step === 'ledger-sign-call' && (
        <LedgerSignStep
          index={2}
          total={2}
          label="Contract call"
          details={contractCallLedgerDetails}
          approval={ledgerApproval}
          onApproveOnDevice={() => setLedgerApproval('approved')}
        />
      )}
    </LedgerSheet>
  ) : undefined;

  const frame = (
    <>
      {step !== 'submitted' && (
        <ExtensionFrame
          title="Sign 2 transactions"
          overlay={ledgerOverlay}
          overlayKey={step}
          footer={
            <Stack gap="space.03">
              <HStack justifyContent="space-between">
                <styled.span textStyle="label.02">Total spend</styled.span>
                <styled.span textStyle="label.02">
                  {formatCurrency(satsToUsd(totalSats))}
                </styled.span>
              </HStack>
              <Flex gap="space.03">
                <Button flex={1} variant="outline" onClick={reset} disabled={isAwaitingSponsor}>
                  Cancel
                </Button>
                <Button
                  flex={1}
                  aria-busy={isAwaitingSponsor}
                  disabled={isAwaitingSponsor}
                  onClick={onApprove}
                >
                  {isAwaitingSponsor ? 'Submitting…' : 'Sign 2 transactions'}
                </Button>
              </Flex>
            </Stack>
          }
        >
          <Stack gap="space.01">
            <MockSection>
              <Flag
                img={<Avatar size="sm" fallback="A" />}
                spacing="space.02"
                textStyle="label.03"
                color="ink.text-subdued"
              >
                Requested by {new URL(mockContractCall.origin).hostname}
              </Flag>
            </MockSection>

            <MockSection title="You'll sign 2 transactions">
              <Stack gap="space.00" mt="space.01">
                <BundleTransaction
                  index={1}
                  title="Fee to sponsor"
                  caption={sbtcTokenContract.functionName}
                  amount={formatCryptoPrecise(sats(feeSats))}
                  nonce={feePaymentNonce}
                  isExpanded={expandedTransaction === 'fee'}
                  onToggle={() => toggleTransaction('fee')}
                >
                  <DetailRow
                    label="To"
                    value={<AddressValue address={mockQuote.feeRecipientPrincipal} />}
                  />
                  <DetailRow
                    label="Amount"
                    value={`${formatCryptoPrecise(sats(feeSats))} · ${feeTierLabels[tier]} fee`}
                  />
                  <DetailRow
                    label="Contract"
                    value={`${sbtcTokenContract.name} · ${sbtcTokenContract.functionName}`}
                  />
                  <styled.span textStyle="caption.01" color="ink.text-subdued">
                    Pays the Leather sponsor, who covers the STX network fee for both transactions.
                    It goes first, so the sponsor is paid even if the call fails.
                  </styled.span>
                </BundleTransaction>
                <BundleTransaction
                  index={2}
                  title={mockContractCall.functionName}
                  caption={mockContractCall.contractName}
                  amount={formatCryptoPrecise(sats(amountSats))}
                  nonce={contractCallNonce}
                  isLast
                  isExpanded={expandedTransaction === 'call'}
                  onToggle={() => toggleTransaction('call')}
                >
                  <DetailRow
                    label="Contract address"
                    value={<AddressValue address={mockContractCall.contractAddress} />}
                  />
                  <DetailRow label="Contract name" value={mockContractCall.contractName} />
                  <DetailRow label="Function name" value={mockContractCall.functionName} />
                  <Stack gap="space.02">
                    <styled.span textStyle="caption.01" color="ink.text-subdued">
                      Arguments
                    </styled.span>
                    {mockContractCall.args.map(arg => (
                      <HStack key={arg.name} justifyContent="space-between" gap="space.03">
                        <styled.span textStyle="caption.01" color="ink.text-subdued">
                          {arg.name} · {arg.type}
                        </styled.span>
                        <styled.span
                          textStyle="caption.01"
                          fontFamily="monospace"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          maxWidth="60%"
                          title={arg.value}
                        >
                          {arg.value}
                        </styled.span>
                      </HStack>
                    ))}
                  </Stack>
                </BundleTransaction>
              </Stack>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {isLedger
                  ? 'Your Ledger asks you to approve each one. Both are then handed to the sponsor, which broadcasts them in order: transaction 2 runs only after transaction 1 confirms.'
                  : 'Signed together and handed to the sponsor, which broadcasts them in order: transaction 2 runs only after transaction 1 confirms.'}
              </styled.span>
            </MockSection>

            <MockSection title="Post conditions">
              <Flag img={<SbtcAvatarIcon size="lg" />}>
                <HStack justifyContent="space-between">
                  <Stack gap="space.00">
                    <styled.span textStyle="label.02">You'll transfer exactly</styled.span>
                    <styled.span textStyle="caption.01" color="ink.text-subdued">
                      sBTC · deny mode · across both transactions
                    </styled.span>
                  </Stack>
                  <styled.span textStyle="label.02">
                    {formatCryptoPrecise(sats(amountSats + feeSats))}
                  </styled.span>
                </HStack>
              </Flag>
            </MockSection>

            <MockSection title="Signing account">
              <Flag img={<Avatar size="lg" fallback="A1" />}>
                <HStack justifyContent="space-between">
                  <Stack gap="space.00">
                    <HStack gap="space.02">
                      <styled.span textStyle="label.02">{mockAccount.name}</styled.span>
                      {isLedger && <Badge label="Ledger" icon={<LockIcon variant="small" />} />}
                    </HStack>
                    <AddressValue address={mockAccount.address} />
                  </Stack>
                  <Stack gap="space.00" alignItems="end">
                    <styled.span textStyle="label.02">
                      {formatCryptoPrecise(microStx(mockAccount.stxBalanceMicro))}
                    </styled.span>
                    <styled.span textStyle="caption.01" color="ink.text-subdued">
                      {formatCryptoPrecise(sats(mockAccount.sbtcBalanceSats))}
                    </styled.span>
                  </Stack>
                </HStack>
              </Flag>
            </MockSection>

            <MockSection title="Fee">
              <Callout variant="info" title="Paid in sBTC">
                You hold no STX. A Leather sponsor pays the STX network fee for both transactions
                and takes this sBTC fee in transaction 1.
              </Callout>
              <Box mt="space.02">
                <styled.button
                  type="button"
                  width="100%"
                  cursor="pointer"
                  textAlign="left"
                  onClick={() => setIsFeePickerOpen(open => !open)}
                >
                  <Flag img={<Avatar size="lg" icon={<GiftIcon />} />}>
                    <HStack justifyContent="space-between">
                      <Stack gap="space.00">
                        <HStack gap="space.02">
                          <styled.span textStyle="label.02">{feeTierLabels[tier]}</styled.span>
                          <SponsoredBadge />
                        </HStack>
                        <styled.span textStyle="caption.01" color="ink.text-subdued">
                          {feeTierTimes[tier]} · covers 2 transactions
                        </styled.span>
                      </Stack>
                      <HStack gap="space.02">
                        <Stack gap="space.00" alignItems="end">
                          <styled.span textStyle="label.02">
                            {formatCryptoPrecise(sats(feeSats))}
                          </styled.span>
                          <styled.span textStyle="caption.01" color="ink.text-subdued">
                            {formatCurrency(satsToUsd(feeSats))}
                          </styled.span>
                        </Stack>
                        <ChevronDownIcon variant="small" />
                      </HStack>
                    </HStack>
                  </Flag>
                </styled.button>
                {isFeePickerOpen && (
                  <Stack gap="space.01" mt="space.02" pl="space.02">
                    {feeTiers.map(option => (
                      <styled.button
                        key={option}
                        type="button"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        px="space.03"
                        py="space.02"
                        borderRadius="xs"
                        cursor="pointer"
                        _hover={{ bg: 'ink.component-background-hover' }}
                        onClick={() => {
                          setTier(option);
                          setIsFeePickerOpen(false);
                        }}
                      >
                        <HStack gap="space.02">
                          <styled.span textStyle="label.02">{feeTierLabels[option]}</styled.span>
                          <styled.span textStyle="caption.01" color="ink.text-subdued">
                            {feeTierTimes[option]}
                          </styled.span>
                          {option === tier && <CheckmarkIcon variant="small" />}
                        </HStack>
                        <styled.span textStyle="label.02">
                          {formatCryptoPrecise(sats(feeSatsByTier[option]))}
                        </styled.span>
                      </styled.button>
                    ))}
                  </Stack>
                )}
              </Box>
            </MockSection>
          </Stack>
        </ExtensionFrame>
      )}

      {step === 'submitted' && (
        <ExtensionFrame
          title="Submitted"
          footer={
            <Button fullWidth disabled iconStart={<CheckmarkIcon variant="small" />}>
              Submitted
            </Button>
          }
        >
          <Stack gap="space.01">
            <MockSection>
              <Stack alignItems="center" py="space.03" gap="space.02">
                <CheckmarkCircleIcon color="green.action-primary-default" />
                <styled.span textStyle="heading.05">Two transactions sent</styled.span>
                <styled.span textStyle="caption.01" color="ink.text-subdued" textAlign="center">
                  The sponsor broadcast them in order. The call confirms after the fee payment.
                </styled.span>
              </Stack>
            </MockSection>
            <MockSection>
              <Stack gap="space.03">
                <MockTransactionCard
                  index={1}
                  title="Fee payment"
                  description={`${formatCryptoPrecise(sats(feeSats))} to the sponsor`}
                  nonce={feePaymentNonce}
                  txid={mockTxids.feePayment}
                  status={feePaymentStatus}
                />
                <MockTransactionCard
                  index={2}
                  title={mockContractCall.functionName}
                  description={`${mockContractCall.contractName} · ${formatCryptoPrecise(sats(amountSats))}`}
                  nonce={contractCallNonce}
                  txid={mockTxids.contractCall}
                  status={contractCallStatus}
                />
              </Stack>
            </MockSection>
            <MockSection>
              <InfoRow title="Total spend" value={formatCryptoPrecise(sats(totalSats))} />
              <InfoRow
                title="Fee"
                titleAddon={<SponsoredBadge />}
                value={formatCryptoPrecise(sats(feeSats))}
              />
            </MockSection>
          </Stack>
        </ExtensionFrame>
      )}
    </>
  );

  return (
    <FlowBoard
      frame={frame}
      onReset={reset}
      timeline={<Timeline title="Behind the scenes" steps={steps} activeIndex={timelineIndex} />}
    />
  );
}
