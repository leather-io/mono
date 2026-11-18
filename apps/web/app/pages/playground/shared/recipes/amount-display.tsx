import { Stack, styled } from 'leather-styles/jsx';

import { defineRecipeMeta } from './recipe-meta';

const nonBreakingSpace = ' ';

const amountFiatGap = 'space.02';

export const amountDisplayMeta = defineRecipeMeta({
  name: 'Amount display (AmountDisplay; ReviewSheet amount)',
  mirrors:
    'apps/extension/src/app/pages/send/send-crypto-asset-form/components/amount-field.tsx (entry), components/info-card/info-card.tsx InfoCardAssetValue (review, sent)',
  useWhen: [
    'The amount a screen is about, once per screen: entry on the send form, summary on review and sent',
    'ReviewSheet: pass `amount` (not a hand-built headline) so review and send match',
  ],
  dontUseWhen: [
    { situation: 'An amount in a key-value row', use: 'ReviewRow (label.02)' },
    { situation: 'An amount in a list', use: 'AssetRow' },
    { situation: 'A monospace amount', use: 'never: mono is for full addresses and code' },
  ],
});

export interface AmountDisplayProps {
  amount: string;
  symbol: string;
  fiat?: string;
  size?: 'entry' | 'summary';
  isEmpty?: boolean;
  inset?: 'default' | 'tight';
}

export function AmountDisplay({
  amount,
  symbol,
  fiat,
  size = 'summary',
  isEmpty = false,
  inset = 'default',
}: AmountDisplayProps) {
  return (
    <Stack
      alignItems="center"
      gap={amountFiatGap}
      py={inset === 'tight' ? 'space.03' : 'space.05'}
      textAlign="center"
      data-amount-display=""
    >
      <styled.span
        textStyle={size === 'entry' ? 'heading.02' : 'heading.03'}
        color={isEmpty ? 'ink.text-subdued' : 'ink.text-primary'}
      >
        {[amount, symbol].join(nonBreakingSpace)}
      </styled.span>
      {fiat ? (
        <styled.span textStyle="label.02" color="ink.text-subdued">
          {fiat}
        </styled.span>
      ) : null}
    </Stack>
  );
}
