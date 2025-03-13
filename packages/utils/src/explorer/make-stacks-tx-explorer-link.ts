import { HIRO_EXPLORER_URL } from '@leather.io/constants';
import { BitcoinNetworkModes, HIRO_API_BASE_URL_NAKAMOTO_TESTNET } from '@leather.io/models';

interface MakeStacksTxExplorerLinkArgs {
  mode: BitcoinNetworkModes;
  searchParams?: URLSearchParams;
  txid: string;
  isNakamoto?: boolean;
}
//  TODO LEA-2285: Remove this function from the extension
export function makeStacksTxExplorerLink({
  mode,
  searchParams = new URLSearchParams(),
  txid,
  isNakamoto = false,
}: MakeStacksTxExplorerLinkArgs) {
  if (mode === 'regtest') return 'http://localhost:8000/txid/' + txid;
  searchParams.append('chain', mode);
  if (isNakamoto) searchParams.append('api', HIRO_API_BASE_URL_NAKAMOTO_TESTNET);
  return `${HIRO_EXPLORER_URL}/txid/${txid}?${searchParams.toString()}`;
}
