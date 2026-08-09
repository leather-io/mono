import type { Money } from '@leather.io/models';
import type {
  AccountQuotedBtcBalance,
  AddressQuotedStxBalance,
  Sip10AggregateBalance,
  Sip10Balance,
} from '@leather.io/services';
import { sumMoney } from '@leather.io/utils';

interface BalancesViewInput {
  btc: AccountQuotedBtcBalance;
  stx: AddressQuotedStxBalance;
  sip10: Sip10AggregateBalance;
}

function formatMoney(money: Money): string {
  return money.amount.shiftedBy(-money.decimals).toFixed();
}

function formatFiat(money: Money): string {
  return money.amount.shiftedBy(-money.decimals).toFixed(money.decimals);
}

function nonZeroAmounts(fields: Record<string, Money>): Record<string, string> {
  const present: Record<string, string> = {};
  for (const [key, money] of Object.entries(fields)) {
    if (!money.amount.isZero()) present[key] = formatMoney(money);
  }
  return present;
}

export function buildBtcBalanceView({ btc, quote }: AccountQuotedBtcBalance) {
  return {
    amount: formatMoney(btc.totalBalance),
    available: formatMoney(btc.availableBalance),
    fiatValue: formatFiat(quote.totalBalance),
    ...nonZeroAmounts({
      unconfirmedInbound: btc.inboundBalance,
      unconfirmedOutbound: btc.outboundBalance,
      dust: btc.dustBalance,
    }),
  };
}

export function buildStxBalanceView({ stx, quote }: AddressQuotedStxBalance) {
  return {
    amount: formatMoney(stx.totalBalance),
    available: formatMoney(stx.availableUnlockedBalance),
    fiatValue: formatFiat(quote.totalBalance),
    ...nonZeroAmounts({
      locked: stx.lockedBalance,
      unconfirmedInbound: stx.inboundBalance,
      unconfirmedOutbound: stx.outboundBalance,
    }),
  };
}

export function buildSip10TokenView({ asset, crypto, quote }: Sip10Balance) {
  const amount = formatMoney(crypto.totalBalance);
  const available = formatMoney(crypto.availableBalance);
  return {
    symbol: asset.symbol,
    name: asset.name,
    assetId: asset.assetId,
    amount,
    ...(available !== amount ? { available } : {}),
    fiatValue: formatFiat(quote.totalBalance),
  };
}

export function buildBalancesView({ btc, stx, sip10 }: BalancesViewInput) {
  const totalFiat = sumMoney([
    btc.quote.totalBalance,
    stx.quote.totalBalance,
    sip10.quote.totalBalance,
  ]);
  const availableFiat = sumMoney([
    btc.quote.availableBalance,
    stx.quote.availableBalance,
    sip10.quote.availableBalance,
  ]);
  const tokens = sip10.sip10s
    .slice()
    .sort((a, b) => b.quote.totalBalance.amount.comparedTo(a.quote.totalBalance.amount) ?? 0)
    .map(buildSip10TokenView);

  return {
    currency: totalFiat.symbol,
    totalFiatValue: formatFiat(totalFiat),
    availableFiatValue: formatFiat(availableFiat),
    btc: buildBtcBalanceView(btc),
    stx: buildStxBalanceView(stx),
    sip10Tokens: tokens,
  };
}
