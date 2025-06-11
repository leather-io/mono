import { BaseCryptoAssetBalance, BtcBalance, Money, StxBalance } from '@leather.io/models';

import { createMoney, subtractMoney, sumMoney } from '../money';

export function createBaseCryptoAssetBalance(
  totalBalance: Money,
  inboundBal?: Money,
  outboundBal?: Money
): BaseCryptoAssetBalance {
  const zeroBalance = createMoney(0, totalBalance.symbol);
  const inboundBalance = inboundBal ?? zeroBalance;
  const outboundBalance = outboundBal ?? zeroBalance;
  return {
    totalBalance,
    inboundBalance,
    outboundBalance,
    pendingBalance: subtractMoney(sumMoney([totalBalance, inboundBalance]), outboundBalance),
    availableBalance: subtractMoney(totalBalance, outboundBalance),
  };
}

export function createBtcBalance(
  totalBalance: Money,
  inboundBal?: Money,
  outboundBal?: Money,
  protectedBal?: Money,
  uneconomicalBal?: Money,
  unspendableBal?: Money
): BtcBalance {
  const zeroBalance = createMoney(0, totalBalance.symbol);
  const inboundBalance = inboundBal ?? zeroBalance;
  const outboundBalance = outboundBal ?? zeroBalance;
  const protectedBalance = protectedBal ?? zeroBalance;
  const uneconomicalBalance = uneconomicalBal ?? zeroBalance;
  const unspendableBalance = unspendableBal ?? zeroBalance;
  const baseBalance = createBaseCryptoAssetBalance(totalBalance, inboundBalance, outboundBalance);
  return {
    ...baseBalance,
    protectedBalance,
    uneconomicalBalance,
    availableBalance: subtractMoney(totalBalance, unspendableBalance),
    unspendableBalance,
  };
}

export function createStxBalance(
  totalBalance: Money,
  inboundBal?: Money,
  outboundBal?: Money,
  lockedBal?: Money
): StxBalance {
  const zeroBalance = createMoney(0, totalBalance.symbol);
  const inboundBalance = inboundBal ?? zeroBalance;
  const outboundBalance = outboundBal ?? zeroBalance;
  const lockedBalance = lockedBal ?? zeroBalance;
  const baseBalance = createBaseCryptoAssetBalance(totalBalance, inboundBalance, outboundBalance);
  const availableBalance = subtractMoney(totalBalance, outboundBalance);
  return {
    ...baseBalance,
    lockedBalance,
    unlockedBalance: subtractMoney(totalBalance, lockedBalance),
    availableBalance,
    availableUnlockedBalance: subtractMoney(availableBalance, lockedBalance),
  };
}

export function aggregateBaseCryptoAssetBalances(
  balances: BaseCryptoAssetBalance[]
): BaseCryptoAssetBalance {
  return createBaseCryptoAssetBalance(
    sumMoney(balances.map(b => b.totalBalance)),
    sumMoney(balances.map(b => b.inboundBalance)),
    sumMoney(balances.map(b => b.outboundBalance))
  );
}

export function aggregateBtcBalances(balances: BtcBalance[]): BtcBalance {
  return createBtcBalance(
    sumMoney(balances.map(b => b.totalBalance)),
    sumMoney(balances.map(b => b.inboundBalance)),
    sumMoney(balances.map(b => b.outboundBalance)),
    sumMoney(balances.map(b => b.protectedBalance)),
    sumMoney(balances.map(b => b.uneconomicalBalance)),
    sumMoney(balances.map(b => b.unspendableBalance))
  );
}

export function aggregateStxBalances(balances: StxBalance[]): StxBalance {
  return createStxBalance(
    sumMoney(balances.map(b => b.totalBalance)),
    sumMoney(balances.map(b => b.inboundBalance)),
    sumMoney(balances.map(b => b.outboundBalance)),
    sumMoney(balances.map(b => b.lockedBalance))
  );
}
