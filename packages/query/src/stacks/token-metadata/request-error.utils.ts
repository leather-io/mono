export function getRequestErrorStatus(error: unknown) {
  if (typeof error !== 'object' || error === null || !('request' in error)) return undefined;
  const { request } = error;
  if (typeof request !== 'object' || request === null || !('status' in request)) return undefined;
  return request.status;
}
