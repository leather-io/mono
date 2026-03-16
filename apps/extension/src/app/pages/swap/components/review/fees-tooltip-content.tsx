import { Flex, styled } from 'leather-styles/jsx';

import { SwapProviderId } from '@leather.io/models';
import { LiveSwapEstimate } from '@leather.io/state/swap';

import { formatCurrency } from '@app/common/currency-formatter';

type SuccessLiveSwapEstimate = Extract<LiveSwapEstimate, { status: 'success' }>;

const providerDisplayNames: Record<SwapProviderId, string> = {
  'bitflow-sdk': 'Bitflow',
  'alex-sdk': 'ALEX',
  'velar-sdk': 'Velar',
  'sbtc-bridge': 'sBTC Bridge',
  'bitflow-bff-api': 'Bitflow',
};

interface FeesTooltipContentProps {
  fees: SuccessLiveSwapEstimate['fees'];
  provider: SwapProviderId;
}

export function FeesTooltipContent({ fees, provider }: FeesTooltipContentProps) {
  const { network, provider: providerFee } = fees;
  const providerName = providerDisplayNames[provider];

  return (
    <Flex direction="column" gap="space.04">
      <FeeRow
        label="Network fee"
        amount={`${formatCurrency(network.crypto)} (~${formatCurrency(network.quote)})`}
        description="Paid to network validators to process your transaction"
      />
      {providerFee && (
        <FeeRow
          label={`${providerName} fee`}
          amount={`${formatCurrency(providerFee.crypto)} (~${formatCurrency(providerFee.quote)})`}
          description={`Fee charged by ${providerName} for facilitating the swap`}
        />
      )}
    </Flex>
  );
}

interface FeeRowProps {
  label: string;
  amount: string;
  description: string;
}

function FeeRow({ label, amount, description }: FeeRowProps) {
  return (
    <Flex direction="column" gap="space.01">
      <Flex justifyContent="space-between">
        <styled.span textStyle="label.03">{label}</styled.span>
        <styled.span textStyle="label.03">{amount}</styled.span>
      </Flex>
      <styled.span textStyle="label.03" color="ink.text-subdued">
        {description}
      </styled.span>
    </Flex>
  );
}
