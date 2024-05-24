import { useGetBnsNamesOwnedByAddress } from './bns.query';

export function useCurrentAccountNames(address: string) {
  return useGetBnsNamesOwnedByAddress(address, {
    select: resp => resp.names ?? [],
  });
}
