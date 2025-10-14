import { useSelector } from 'react-redux';

import { selectRootKeychain } from './in-memory-key.selectors';

export function useWalletFingerprint() {
  const rootKeychain = useSelector(selectRootKeychain);
  return rootKeychain?.fingerprint;
}
