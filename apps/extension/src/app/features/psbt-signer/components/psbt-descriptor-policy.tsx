import { HStack, Stack, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { Callout } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import {
  BondSpendingConditions,
  type BondSpendingDetails,
  formatVaultRequirement,
} from '@app/components/bond-spending-conditions';
import { useCalculateBitcoinFiatValue } from '@app/query/common/market-data/market-data.hooks';

import type { DescriptorPsbtDetails } from '../hooks/use-descriptor-psbt-details';
import { PsbtRequestDetailsSectionLayout } from './psbt-request-details-section.layout';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PsbtRequestDetailsSectionLayout>
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {title}
      </styled.span>
      {children}
    </PsbtRequestDetailsSectionLayout>
  );
}

function AmountWithFiat({ value }: { value: Money }) {
  const calculateBitcoinFiatValue = useCalculateBitcoinFiatValue();
  return (
    <Stack alignItems="flex-end" gap="space.01">
      <styled.span textStyle="label.01">{formatCurrency(value)}</styled.span>
      <styled.span textStyle="caption.01">
        {formatCurrency(calculateBitcoinFiatValue(value))}
      </styled.span>
    </Stack>
  );
}

const policyWarningIntro =
  'This spends from a shared policy (descriptor), not your personal wallet. Leather is adding your signature for the input(s) you control — other signers or spending conditions may also apply.';
const broadcastWarning =
  'If your signature completes the policy, Leather will broadcast this transaction immediately and it cannot be undone.';
const trustNote = 'Only approve if you understand and trust this contract.';

const bondProposalTitle = 'You are proposing a vault transaction';
function makeBondProposalBody(details: BondSpendingDetails) {
  return `This proposes a spend from a policy owned by your vault. It becomes spendable by ${formatVaultRequirement(details)} from block ${details.unlockHeight}, or earlier if the counterparty shown below also signs and reveals the hash secret. Nothing is signed or broadcast now — co-signers must approve the proposal first. ${trustNote}`;
}

interface PsbtDescriptorPolicyProps {
  bondDetails?: BondSpendingDetails;
  descriptor: string;
  details: DescriptorPsbtDetails | null;
  willBroadcast?: boolean;
}
export function PsbtDescriptorPolicy({
  bondDetails,
  descriptor,
  details,
  willBroadcast,
}: PsbtDescriptorPolicyProps) {
  const warningTitle = willBroadcast
    ? 'Signing may broadcast this transaction'
    : 'You are co-signing a contract transaction';
  const warningBody = willBroadcast
    ? `${policyWarningIntro} ${broadcastWarning} ${trustNote}`
    : `${policyWarningIntro} ${trustNote}`;
  const calloutTitle = bondDetails ? bondProposalTitle : warningTitle;
  const calloutBody = bondDetails ? makeBondProposalBody(bondDetails) : warningBody;

  return (
    <>
      <Callout variant="warning" title={calloutTitle}>
        {calloutBody}
      </Callout>

      {bondDetails ? (
        <Section title="Spending conditions">
          <BondSpendingConditions details={bondDetails} />
        </Section>
      ) : null}

      {details ? (
        <>
          <Section title="Spending from policy">
            <styled.span textStyle="label.02" wordBreak="break-all">
              {details.policyAddress}
            </styled.span>
          </Section>

          <Section title="Amount leaving policy">
            <HStack alignItems="center" justifyContent="space-between">
              <styled.span textStyle="label.01">Total</styled.span>
              <AmountWithFiat value={details.amountLeavingPolicy} />
            </HStack>
          </Section>

          {details.destinations.length ? (
            <Section title="Sending to">
              <Stack gap="space.04">
                {details.destinations.map((destination, index) => (
                  <HStack
                    key={`${destination.address}-${index}`}
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap="space.04"
                  >
                    <styled.span textStyle="label.02" wordBreak="break-all" maxWidth="60%">
                      {destination.address ?? 'Unknown recipient'}
                    </styled.span>
                    <AmountWithFiat value={destination.value} />
                  </HStack>
                ))}
              </Stack>
            </Section>
          ) : null}
        </>
      ) : (
        <Callout variant="error" title="Unable to read transaction details">
          Leather could not parse the amounts for this descriptor transaction. Verify the policy
          descriptor below and the raw transaction before approving.
        </Callout>
      )}

      <Section title="Policy descriptor">
        <styled.code textStyle="caption.01" wordBreak="break-all">
          {descriptor}
        </styled.code>
      </Section>
    </>
  );
}
