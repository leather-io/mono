import {
  bufferCVFromString,
  cvToHex,
  cvToString,
  hexToCV,
  responseErrorCV,
  responseOkCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import { HttpResponse, http } from 'msw';

import { isFirstAccount } from '../fixtures/account-funding';
import { bnsUrl, hiroUrl, readPathSegment } from './urls';

const bnsNoPrimaryNameCode = 131;

interface BnsName {
  name: string;
  namespace: string;
}

function namesResponse(names: BnsName[]) {
  return {
    total: names.length,
    current_burn_block: 920000,
    limit: 50,
    offset: 0,
    names: names.map(({ name, namespace }) => ({
      full_name: `${name}.${namespace}`,
      name_string: name,
      namespace_string: namespace,
      owner: '',
      registered_at: '17467',
      renewal_height: '1125982',
      stx_burn: '0',
      revoked: false,
    })),
  };
}

function primaryNameResult(primary: BnsName | null) {
  if (!primary) return cvToHex(responseErrorCV(uintCV(bnsNoPrimaryNameCode)));
  return cvToHex(
    responseOkCV(
      tupleCV({
        name: bufferCVFromString(primary.name),
        namespace: bufferCVFromString(primary.namespace),
      })
    )
  );
}

async function readPrimaryNameOwner(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || !('arguments' in body)) return null;
    const args: unknown = body.arguments;
    const owner: unknown = Array.isArray(args) ? args[0] : undefined;
    return typeof owner === 'string' ? cvToString(hexToCV(owner)) : null;
  } catch {
    return null;
  }
}

function primaryOf(primary: BnsName | null, owner: string | null) {
  return owner !== null && isFirstAccount(owner) ? primary : null;
}

export function bnsHandlers(primary: BnsName | null) {
  return [
    http.get(bnsUrl('/names/address/:segment/valid'), ({ request }) => {
      const owned = primaryOf(primary, readPathSegment(request.url, -2));
      return HttpResponse.json(namesResponse(owned ? [owned] : []));
    }),
    http.get(bnsUrl('/zonefile/:segment/raw'), () =>
      HttpResponse.json({ error: 'Not found' }, { status: 404 })
    ),
    http.get(bnsUrl('/names/:segment'), () =>
      HttpResponse.json({ error: 'Name not found' }, { status: 404 })
    ),
    http.post(hiroUrl('/v2/contracts/call-read/:segment/BNS-V2/get-primary'), async ({ request }) =>
      HttpResponse.json({
        okay: true,
        result: primaryNameResult(primaryOf(primary, await readPrimaryNameOwner(request))),
      })
    ),
  ];
}
