import { useSelector } from 'react-redux';

import { selectCurrentAccountIndex } from '../software-keys/software-key.selectors';

export function useCurrentAccountIndex() {
  return useSelector(selectCurrentAccountIndex);
}
