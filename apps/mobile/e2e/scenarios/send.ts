import { HttpResponse, type RequestHandler, http } from 'msw';

import { type LeatherUtxo, readDescriptorOwnedAddress } from '../fixtures/bitcoin';
import { swapBffPairs, swapBffQuote, swapBffSwap, swapBffTokens } from '../fixtures/send-swap';
import { launchDarklyHandlers } from '../handlers/launchdarkly';
import { bitcoinUtxosHandlers } from '../handlers/leather-api';
import { bnsUrl } from '../handlers/urls';

const taprootUtxoTxid = 'aa11bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899';
const nativeSegwitUtxoTxid = 'bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899aa11';
const utxoHeight = 870000;

const bnsName = 'test-hiro-wallet';
const bnsResolvedAddress = 'SP12YQ0M2KFT7YMJKVGP71B874YF055F77PFPH9KM';

const bnsNameLookup = http.get(bnsUrl(`/names/${bnsName}.btc`), () =>
  HttpResponse.json({
    current_burn_block: 900937,
    status: 'active',
    data: {
      name_string: bnsName,
      namespace_string: 'btc',
      full_name: `${bnsName}.btc`,
      owner: bnsResolvedAddress,
      registered_at: '17467',
      renewal_height: '1125982',
      stx_burn: '0',
      revoked: false,
      imported_at: 'none',
      preordered_by: 'none',
      is_valid: true,
    },
  })
);

const bitflowBffUrl = 'https://bff.bitflowapis.finance/api/quotes/v1';

const swapHandlers = [
  http.get(new RegExp(`^${bitflowBffUrl}/tokens`), () => HttpResponse.json(swapBffTokens)),
  http.get(new RegExp(`^${bitflowBffUrl}/pairs`), () => HttpResponse.json(swapBffPairs)),
  http.all(new RegExp(`^${bitflowBffUrl}/quote`), () => HttpResponse.json(swapBffQuote)),
  http.all(new RegExp(`^${bitflowBffUrl}/swap`), () => HttpResponse.json(swapBffSwap)),
];

interface MixedUtxoValues {
  taprootSats: number;
  nativeSegwitSats: number;
}

function mixedUtxos({ taprootSats, nativeSegwitSats }: MixedUtxoValues) {
  return function readUtxos(descriptor: string): LeatherUtxo[] {
    const owned = readDescriptorOwnedAddress(descriptor);
    if (!owned) return [];
    const isTaproot = descriptor.startsWith('tr(');
    return [
      {
        txid: isTaproot ? taprootUtxoTxid : nativeSegwitUtxoTxid,
        vout: isTaproot ? 0 : 1,
        value: String(isTaproot ? taprootSats : nativeSegwitSats),
        height: utxoHeight,
        ...owned,
      },
    ];
  };
}

export const sendScenarios: Record<string, RequestHandler[]> = {
  'send-mixed-utxos': bitcoinUtxosHandlers(
    mixedUtxos({ taprootSats: 300000, nativeSegwitSats: 200000 })
  ),
  'send-max-mixed-utxos': bitcoinUtxosHandlers(
    mixedUtxos({ taprootSats: 100000, nativeSegwitSats: 200000 })
  ),
  'send-bns-lookup': [bnsNameLookup],
  'send-swap': swapHandlers,
  'send-swap-bridging-off': launchDarklyHandlers({ swap_sbtc_bridging: false }),
};
