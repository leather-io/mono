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
    totalBalance: totalBalance,
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
  uneconomicalBal?: Money
): BtcCryptoAssetBalance {
  const zeroBalance = createMoney(0, totalBalance.symbol);
  const inboundBalance = inboundBal ?? zeroBalance;
  const outboundBalance = outboundBal ?? zeroBalance;
  const protectedBalance = protectedBal ?? zeroBalance;
  const uneconomicalBalance = uneconomicalBal ?? zeroBalance;
  const baseBalance = createBaseCryptoAssetBalance(totalBalance, inboundBalance, outboundBalance);
  return {
    ...baseBalance,
    protectedBalance,
    uneconomicalBalance,
    availableBalance: subtractMoney(
      totalBalance,
      sumMoney([protectedBalance, uneconomicalBalance])
    ),
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
