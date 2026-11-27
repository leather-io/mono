import { HttpResponse, http } from 'msw';

import { learnItems } from '../fixtures/cms';
import { readSearchParam } from './urls';

const sanityUrl = /^https:\/\/[a-z0-9]+\.(apicdn|api)\.sanity\.io\//;

export const cmsHandlers = [
  http.get(sanityUrl, ({ request }) =>
    HttpResponse.json({
      result: { key: readSearchParam(request.url, '$key')?.replaceAll('"', ''), items: learnItems },
    })
  ),
];
