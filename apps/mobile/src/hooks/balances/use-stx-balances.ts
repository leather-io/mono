import { useMemo } from 'react';

import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

import { Money } from '@leather.io/models';
import { useStxCryptoAssetBalance } from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

export function useStxBalance(fingerprint: string, accountIndex: number): Money {
  const signers = useStacksSigners().fromAccountIndex(fingerprint, accountIndex);
  const stxAddress = signers[0]?.address;

  const { filteredBalanceQuery } = useStxCryptoAssetBalance(stxAddress || '');

  const balance = filteredBalanceQuery.data;
  const stxBalance = balance ? balance.totalBalance : createMoney(0, 'STX');
  return useMemo(() => {
    return stxBalance;
  }, [stxBalance]);
}
