import { RootState } from '..';
import { useAppSelector } from '../utils';
import { externalAddressesAdapter } from './external-addresses.write';

const externalAddressesSelector = externalAddressesAdapter.getSelectors(
  (state: RootState) => state.externalAddresses
);
export function useExternalAddresses() {
  const list = useAppSelector(externalAddressesSelector.selectAll);
  return {
    list,
    hasExternalAddresses: list.length > 0,
  };
}
