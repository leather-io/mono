import { HttpResponse, http } from 'msw';

const leatherImagesUrl = /^https:\/\/images\.leather\.io\/.+\.svg(\?.*)?$/;

export const imageHandlers = [
  http.head(
    leatherImagesUrl,
    () => new HttpResponse(null, { headers: { 'content-type': 'image/svg+xml' } })
  ),
];
