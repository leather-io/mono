import axios from 'axios';

const leatherHeaders: HeadersInit = {
  'x-partner': 'Leather',
};

axios.interceptors.request.use(request => {
  if (request.url?.includes('hiro.so'))
    Object.entries(leatherHeaders).forEach(([key, value]) => request.headers.set(key, value));

  return request;
});
