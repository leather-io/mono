// import { logger } from '@shared/logger';
import { useGetBnsNamesOwnedByAddress } from './bns.query';

export function useCurrentAccountNames({ stacksAddress }: { stacksAddress: string }) {
  return useGetBnsNamesOwnedByAddress(stacksAddress, {
    select: resp => {
      if (stacksAddress === '') {
        // logger.error('No principal defined');
      }
      return resp.names ?? [];
    },
  });
}

export function useGetAccountNamesByAddressQuery(address: string) {
  return useGetBnsNamesOwnedByAddress(address, { select: resp => resp.names ?? [] });
}
