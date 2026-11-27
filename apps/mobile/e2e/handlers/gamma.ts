import { HttpResponse, http } from 'msw';

const gammaUrl = /^https:\/\/gamma\.io\/api\//;

export const gammaHandlers = [
  http.get(gammaUrl, () => HttpResponse.json({ error: 'Not found' }, { status: 404 })),
];
