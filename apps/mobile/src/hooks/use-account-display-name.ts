import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';
import { toUnicode } from 'punycode';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { createGetBnsNamesOwnedByAddressQueryOptions, useBnsV2Client } from '@leather.io/query';
import { truncateMiddle } from '@leather.io/utils';

export function formatAccountName(input: string | undefined, maxLength = 20, offset = 4) {
  if (!input) return '';

  if (input.length > maxLength) {
    return truncateMiddle(input, offset);
  }
  return input;
}
export function parseIfValidPunycode(s: string) {
  try {
    return toUnicode(s);
  } catch {
    return s;
  }
}

export function useAccountDisplayName({ address }: { address: string }) {
  const { networkPreference } = useSettings();
  const network = bitcoinNetworkModeToCoreNetworkMode(networkPreference.chain.bitcoin.mode);

  const client = useBnsV2Client();
  const query = useQuery({
    ...createGetBnsNamesOwnedByAddressQueryOptions({
      address,
      network,
      client,
    }),
    select: resp => {
      const names = resp.names ?? [];
      return parseIfValidPunycode(formatAccountName(names[0]));
    },
  });

  return {
    ...query,
    data: query.data,
  };
}
