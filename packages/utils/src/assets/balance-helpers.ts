import {
  BaseCryptoAssetBalance,
  BtcCryptoAssetBalance,
  Money,
  StxCryptoAssetBalance,
} from '@leather.io/models';

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

export function createBtcCryptoAssetBalance(
  totalBalance: Money,
  inboundBal?: Money,
  outboundBal?: Money,
  protectedBal?: Money,
  uneconomicalBal?: Money,
  unspendableBal?: Money
): BtcCryptoAssetBalance {
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

export function createStxCryptoAssetBalance(
  totalBalance: Money,
  inboundBal?: Money,
  outboundBal?: Money,
  lockedBal?: Money
): StxCryptoAssetBalance {
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

export function aggregateBtcCryptoAssetBalances(
  balances: BtcCryptoAssetBalance[]
): BtcCryptoAssetBalance {
  return createBtcCryptoAssetBalance(
    sumMoney(balances.map(b => b.totalBalance)),
    sumMoney(balances.map(b => b.inboundBalance)),
    sumMoney(balances.map(b => b.outboundBalance)),
    sumMoney(balances.map(b => b.protectedBalance)),
    sumMoney(balances.map(b => b.uneconomicalBalance)),
    sumMoney(balances.map(b => b.unspendableBalance))
  );
}

export function aggregateStxCryptoAssetBalances(
  balances: StxCryptoAssetBalance[]
): StxCryptoAssetBalance {
  return createStxCryptoAssetBalance(
    sumMoney(balances.map(b => b.totalBalance)),
    sumMoney(balances.map(b => b.inboundBalance)),
    sumMoney(balances.map(b => b.outboundBalance)),
    sumMoney(balances.map(b => b.lockedBalance))
  );
}
