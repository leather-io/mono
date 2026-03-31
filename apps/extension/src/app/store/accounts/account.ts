import { useSelector } from 'react-redux';

import { selectCurrentAccount } from '../software-keys/software-key.selectors';

export function useCurrentAccountId() {
  return useSelector(selectCurrentAccount);
}
