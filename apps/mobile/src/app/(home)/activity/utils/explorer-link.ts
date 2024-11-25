import { HIRO_EXPLORER_URL } from '@leather.io/constants';
import { BitcoinNetworkModes, HIRO_API_BASE_URL_NAKAMOTO_TESTNET } from '@leather.io/models';

// TODO: move to @leather.io/utils / remove from extension
interface MakeStacksTxExplorerLinkArgs {
  mode: BitcoinNetworkModes;
  searchParams?: URLSearchParams;
  txid: string;
  //   isNakamoto?: boolean;
}

export function makeStacksTxExplorerLink({
  mode,
  searchParams = new URLSearchParams(),
  txid,
  //   isNakamoto = false,
}: MakeStacksTxExplorerLinkArgs) {
  searchParams.append('chain', mode);
  //   if (isNakamoto) {
  //     searchParams.append('api', HIRO_API_BASE_URL_NAKAMOTO_TESTNET);
  //   }
  return `${HIRO_EXPLORER_URL}/txid/${txid}?${searchParams.toString()}`;
}
