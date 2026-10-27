// Recipe: the amount a screen is about, large and centred, with fiat under it
// in ink.text-subdued. One recipe for every place an amount leads a screen: the
// send form, the review, the sent summary. The amount → fiat gap is fixed here
// (`amountFiatGap`), so it reads the same on send and review; never set it by
// hand with mt / mb on a copy of the markup (round 3 drew 12px on send and
// 4px on review because each screen copied a different shipped file).
// Amounts in rows are ReviewRow or ListRow.
// Product code formats Money with Balance + formatCurrency; the Playground may
// pass pre-formatted strings from its mock. Amounts are Diatype / Marche,
// never mono (docs/design/never.md#mono-amount).
import { Stack, styled } from 'leather-styles/jsx';

import { defineRecipeMeta } from './recipe-meta';

// Keeps the amount and its symbol on one line.
const nonBreakingSpace = ' ';

// The one gap between an amount and its fiat value, on every screen.
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
  // entry: the send form's figure, heading.02 (Marche 44px; the shipped field
  // sets 48px inline, which is no text style). summary: heading.03, as review
  // and sent. Both keep amountFiatGap and the fiat style.
  size?: 'entry' | 'summary';
  // The amount is still empty ("0"): drawn in ink.text-subdued.
  isEmpty?: boolean;
  // Vertical breathing room: default space.05 above and below; tight space.03
  // under a success visual.
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
