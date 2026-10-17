import { useEffect, useState } from 'react';

import BigNumber from 'bignumber.js';
import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { formatCryptoPrecise, formatCurrency } from '~/utils/currency-formatter';

import {
  Button,
  Callout,
  CheckmarkCircleIcon,
  CopyIcon,
  ExternalLinkIcon,
  Flag,
  Input,
  SbtcAvatarIcon,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import {
  AddressValue,
  ExtensionFrame,
  FeeTierSelect,
  FlowBoard,
  InfoRow,
  InfoSeparator,
  MockCard,
  type MockTxStatus,
  SponsoredBadge,
  Timeline,
  type TimelineStep,
  TxStatusBadge,
} from './extension-frame';
import {
  type FeeTier,
  formatStxFee,
  getFeeSatsByTier,
  mockAccount,
  mockQuote,
  mockRecipient,
  mockTxids,
  sats,
  satsToUsd,
  sbtcDecimals,
  sbtcTransferStxFeeMicro,
} from './sponsorship-mock-data';

type SendStep = 'form' | 'review' | 'submitting' | 'sent';

const submitDelayMs = 1200;
const confirmDelayMs = 4000;
const defaultAmount = '0.001';

function toSats(amount: string): BigNumber {
  const value = new BigNumber(amount);
  if (value.isNaN()) return new BigNumber(0);
  return value.shiftedBy(sbtcDecimals).integerValue(BigNumber.ROUND_DOWN);
}

function getTimelineIndex(step: SendStep, txStatus: MockTxStatus) {
  if (step === 'form') return 1;
  if (step === 'review') return 3;
  if (step === 'submitting') return 4;
  return txStatus === 'confirmed' ? 6 : 5;
}

export function SbtcSendFlow() {
  const [step, setStep] = useState<SendStep>('form');
  const [tier, setTier] = useState<FeeTier>('standard');
  const [amount, setAmount] = useState(defaultAmount);
  const [memo, setMemo] = useState('');
  const [txStatus, setTxStatus] = useState<MockTxStatus>('pending');

  const feeSatsByTier = getFeeSatsByTier(sbtcTransferStxFeeMicro, mockQuote);
  const feeByTier = {
    low: sats(feeSatsByTier.low),
    standard: sats(feeSatsByTier.standard),
    high: sats(feeSatsByTier.high),
  };
  const fiatByTier = {
    low: satsToUsd(feeSatsByTier.low),
    standard: satsToUsd(feeSatsByTier.standard),
    high: satsToUsd(feeSatsByTier.high),
  };

  const feeSats = feeSatsByTier[tier];
  const amountSats = toSats(amount);
  const totalSats = amountSats.plus(feeSats);
  const availableSats = new BigNumber(mockAccount.sbtcBalanceSats);
  const isInsufficient = totalSats.isGreaterThan(availableSats);
  const isAmountInvalid = amountSats.isLessThanOrEqualTo(0) || isInsufficient;

  useEffect(() => {
    if (step !== 'submitting') return;
    const timer = setTimeout(() => setStep('sent'), submitDelayMs);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 'sent') return;
    const timer = setTimeout(() => setTxStatus('confirmed'), confirmDelayMs);
    return () => clearTimeout(timer);
  }, [step]);

  function reset() {
    setStep('form');
    setTier('standard');
    setAmount(defaultAmount);
    setMemo('');
    setTxStatus('pending');
  }

  const steps: TimelineStep[] = [
    {
      label: 'Quote',
      detail: `POST /quote with no body. The service answers a signed quoteId, ${mockQuote.satsPerStx} sats per STX (margin included), a fee range of ${mockQuote.minFeeSats}–${mockQuote.maxFeeSats.toLocaleString()} sats and a ${mockQuote.ttlMinutes}-minute expiry.`,
    },
    {
      label: 'Pick a fee',
      detail: `The wallet prices its own STX estimate at the quoted rate: ${formatStxFee(sbtcTransferStxFeeMicro[tier])} × ${mockQuote.satsPerStx} sats/STX = ${feeSats} sats, clamped to the range. Low, Standard and High are the usual STX tiers, shown in sBTC.`,
    },
    {
      label: 'Build',
      detail: `One sponsored transfer-many call on sbtc-token with two entries: ${formatCryptoPrecise(sats(amountSats))} to the recipient, then ${feeSats} sats to the sponsor's fee recipient. Origin fee 0, nonce ${mockAccount.nextNonce}, deny-mode post-condition equal to amount + fee.`,
    },
    {
      label: 'Review and confirm',
      detail:
        'Amount, fee and total are shown in sBTC. The Sponsored badge explains who pays the STX.',
    },
    {
      label: 'Submit',
      detail:
        'POST /submit with the quoteId and the origin-signed hex. The service re-verifies everything (quote signature and expiry, contract, entries, fee in range, post-condition, balance, next nonce), reserves a sponsor nonce, co-signs, attaches the STX fee and broadcasts.',
    },
    {
      label: 'Track',
      detail:
        'The wallet polls the returned txid until it mines. On quote_expired or stale_nonce it requotes, rebuilds and asks for a second confirmation.',
    },
  ];

  const frame = (
    <>
      {step === 'form' && (
        <ExtensionFrame
          title="Send"
          footer={
            <Stack gap="space.03">
              <Button fullWidth disabled={isAmountInvalid} onClick={() => setStep('review')}>
                Continue
              </Button>
              <HStack justifyContent="space-between">
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  Available balance
                </styled.span>
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {formatCryptoPrecise(sats(availableSats))}
                </styled.span>
              </HStack>
            </Stack>
          }
        >
          <MockCard>
            <Stack gap="space.04">
              <Stack gap="space.02">
                <Input.Root hasError={isInsufficient} shrink>
                  <Input.Label>Amount</Input.Label>
                  <Input.Field
                    inputMode="decimal"
                    value={amount}
                    onChange={event => setAmount(event.target.value)}
                  />
                </Input.Root>
                {isInsufficient ? (
                  <styled.span textStyle="caption.01" color="red.action-primary-default">
                    Insufficient balance
                  </styled.span>
                ) : (
                  <styled.span textStyle="caption.01" color="ink.text-subdued">
                    ~ {formatCurrency(satsToUsd(amountSats))}
                  </styled.span>
                )}
              </Stack>
              <Flag img={<SbtcAvatarIcon size="lg" />}>
                <HStack justifyContent="space-between">
                  <Stack gap="space.00">
                    <styled.span textStyle="label.02">sBTC</styled.span>
                    <styled.span textStyle="caption.01" color="ink.text-subdued">
                      sBTC
                    </styled.span>
                  </Stack>
                  <styled.span textStyle="label.02">
                    {formatCryptoPrecise(sats(availableSats))}
                  </styled.span>
                </HStack>
              </Flag>
              <Input.Root shrink>
                <Input.Label>Recipient</Input.Label>
                <Input.Field value={mockRecipient} readOnly />
              </Input.Root>
              <Input.Root shrink={memo !== ''}>
                <Input.Label>Memo</Input.Label>
                <Input.Field value={memo} onChange={event => setMemo(event.target.value)} />
              </Input.Root>
              <Box mt="space.02">
                <FeeTierSelect
                  tier={tier}
                  feeByTier={feeByTier}
                  fiatByTier={fiatByTier}
                  onChange={setTier}
                />
              </Box>
            </Stack>
          </MockCard>
        </ExtensionFrame>
      )}

      {(step === 'review' || step === 'submitting') && (
        <ExtensionFrame
          title="Review"
          onBack={() => setStep('form')}
          footer={
            <Button
              fullWidth
              aria-busy={step === 'submitting'}
              disabled={step === 'submitting'}
              onClick={() => setStep('submitting')}
            >
              {step === 'submitting' ? 'Submitting…' : 'Confirm and send transaction'}
            </Button>
          }
        >
          <MockCard>
            <Stack alignItems="center" py="space.04" gap="space.01">
              <styled.h1 textStyle="heading.03" textTransform="none">
                {formatCryptoPrecise(sats(amountSats))}
              </styled.h1>
              <styled.span textStyle="label.01" color="ink.text-subdued">
                ~ {formatCurrency(satsToUsd(amountSats))}
              </styled.span>
            </Stack>
            <Callout variant="info" title="Sending to an exchange?" mb="space.04">
              Make sure you include the memo so the exchange can credit the sBTC to your account
            </Callout>
            <InfoRow title="To" value={<AddressValue address={mockRecipient} />} />
            <InfoSeparator />
            <InfoRow title="Total spend" value={formatCryptoPrecise(sats(totalSats))} />
            <InfoRow title="Sending" value={formatCryptoPrecise(sats(amountSats))} />
            <InfoRow
              title="Fee"
              titleAddon={<SponsoredBadge />}
              value={formatCryptoPrecise(sats(feeSats))}
            />
            <InfoRow title="Memo" value={memo === '' ? 'No memo' : memo} />
            <InfoRow title="Nonce" value={String(mockAccount.nextNonce)} />
          </MockCard>
        </ExtensionFrame>
      )}

      {step === 'sent' && (
        <ExtensionFrame
          title="Sent"
          footer={
            <Flex gap="space.03">
              <Button flex={1} variant="outline" iconEnd={<CopyIcon variant="small" />}>
                Copy ID
              </Button>
              <Button flex={1} variant="outline" iconEnd={<ExternalLinkIcon variant="small" />}>
                View details
              </Button>
            </Flex>
          }
        >
          <MockCard>
            <Stack alignItems="center" py="space.04" gap="space.03">
              <CheckmarkCircleIcon color="green.action-primary-default" />
              <styled.h1 textStyle="heading.03" textTransform="none">
                {formatCryptoPrecise(sats(amountSats))}
              </styled.h1>
              <styled.span textStyle="label.01" color="ink.text-subdued">
                ~ {formatCurrency(satsToUsd(amountSats))}
              </styled.span>
            </Stack>
            <InfoRow title="To" value={<AddressValue address={mockRecipient} />} />
            <InfoSeparator />
            <InfoRow title="Status" value={<TxStatusBadge status={txStatus} />} />
            <InfoRow title="Total spend" value={formatCryptoPrecise(sats(totalSats))} />
            <InfoRow title="Sending" value={formatCryptoPrecise(sats(amountSats))} />
            <InfoRow
              title="Fee"
              titleAddon={<SponsoredBadge />}
              value={formatCryptoPrecise(sats(feeSats))}
            />
            <InfoRow title="Memo" value={memo === '' ? '—' : memo} />
            <InfoRow title="Nonce" value={String(mockAccount.nextNonce)} />
            <InfoRow
              title="Transaction ID"
              value={
                <styled.span textStyle="label.02" fontFamily="monospace">
                  {truncateMiddle(mockTxids.sbtcTransfer, 6)}
                </styled.span>
              }
            />
          </MockCard>
        </ExtensionFrame>
      )}
    </>
  );

  return (
    <FlowBoard
      frame={frame}
      onReset={reset}
      timeline={
        <Timeline
          title="Behind the scenes"
          steps={steps}
          activeIndex={getTimelineIndex(step, txStatus)}
        />
      }
    />
  );
}
