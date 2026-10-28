import axios from 'axios';
import { entries } from 'remeda';

const leatherHeaders = {
  'x-partner': 'Leather',
} satisfies HeadersInit;

axios.interceptors.request.use(request => {
  if (request.url?.includes('hiro.so'))
    entries(leatherHeaders).forEach(([key, value]) => request.headers.set(key, value));

  return request;
});
