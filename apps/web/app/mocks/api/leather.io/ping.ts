const resp = {
  success: 'mock-mode',
};

// This is not a real request, here for purposes of testing/ensuring mock works
export const leatherPingHandler = {
  path: 'https://*.leather.io/v1/ping',
  resp,
  method: 'get',
} as const;
