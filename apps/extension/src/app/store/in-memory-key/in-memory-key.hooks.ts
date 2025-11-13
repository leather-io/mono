import { useSelector } from 'react-redux';

import { selectActiveWalletRootKeychain } from './in-memory-key.selectors';

export function useWalletFingerprint() {
  const rootKeychain = useSelector(selectActiveWalletRootKeychain);
  return rootKeychain?.fingerprint;
}
