import { useMemo } from 'react';

import { cvToValue, hexToCV } from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import { BTC_DECIMALS } from '@leather.io/constants';
import { convertAmountToFractionalUnit, createMoney } from '@leather.io/utils';

import { useGetCurrentSbtcSupply, useGetSbtcLimits } from './sbtc-limits.query';

export function useRemainingSbtcSupply() {
  const { data: sBtcLimits } = useGetSbtcLimits();
  const { data: supply } = useGetCurrentSbtcSupply();

  return useMemo(() => {
    const sBtcPegCap = sBtcLimits?.pegCap;
    if (!sBtcPegCap || !supply) return;
    const currentSupplyValue = supply?.result && cvToValue(hexToCV(supply?.result));
    return convertAmountToFractionalUnit(
      createMoney(
        new BigNumber(Number(sBtcPegCap - currentSupplyValue?.value)),
        'BTC',
        BTC_DECIMALS
      )
    );
  }, [sBtcLimits?.pegCap, supply]);
}
