import { InfoSheet } from '@/features/swap/components/info-sheet/info-sheet';
import { formatCurrency } from '@/utils/currency-formatter';
import { MessageDescriptor, i18n } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';

import { SwapProviderId } from '@leather.io/models';
import { LiveSwapEstimate } from '@leather.io/state/swap';
import { Box, Text } from '@leather.io/ui/native';

type SuccessLiveSwapEstimate = Extract<LiveSwapEstimate, { status: 'success' }>;

interface FeesInfoSheetProps {
  fees: SuccessLiveSwapEstimate['fees'];
  provider: SwapProviderId;
}

const providerDisplayNames: Record<SwapProviderId, MessageDescriptor> = {
  'bitflow-sdk': msg`Bitflow`,
  'alex-sdk': msg`ALEX`,
  'velar-sdk': msg`Velar`,
  'sbtc-bridge': msg`sBTC Bridge`,
};

export function FeesInfoSheet({ fees, provider }: FeesInfoSheetProps) {
  const { network, provider: providerFee } = fees;
  const providerName = i18n._(providerDisplayNames[provider]);

  return (
    <InfoSheet title={t`Fees`}>
      <Box gap="4">
        <FeeRow
          label={t`Network fee`}
          crypto={formatCurrency(network.crypto)}
          quote={formatCurrency(network.quote)}
          description={t`Paid to network validators to process your transaction`}
        />

        {providerFee && (
          <FeeRow
            label={t`${providerName} fee`}
            crypto={formatCurrency(providerFee.crypto)}
            quote={formatCurrency(providerFee.quote)}
            description={t`Fee charged by ${providerName} for facilitating the swap`}
          />
        )}
      </Box>
    </InfoSheet>
  );
}

interface FeeRowProps {
  label: string;
  crypto: string;
  quote: string;
  description: string;
}

function FeeRow({ label, crypto, quote, description }: FeeRowProps) {
  return (
    <Box gap="1">
      <Box flexDirection="row" justifyContent="space-between">
        <Text variant="label02">{label}</Text>
        <Text variant="label02">{`${crypto} (~${quote})`}</Text>
      </Box>
      <Text variant="body02" color="ink.text-subdued-secondary">
        {description}
      </Text>
    </Box>
  );
}
