import { useContext } from 'react';

import { AppContext } from '@common/context';

export function useSTXAddress(): string | undefined {
  const { userData } = useContext(AppContext);
  return userData?.profile?.stxAddress?.testnet as string;
}
