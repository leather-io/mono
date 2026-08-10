const deprecationError =
  'This legacy method is no longer supported. Upgrade to the LeatherProvider.request() RPC API, see https://leather.gitbook.io/developers';

export function deprecatedProviderMethods() {
  return {
    getURL(): Promise<never> {
      return Promise.reject(new Error(deprecationError));
    },
    authenticationRequest(): Promise<never> {
      return Promise.reject(new Error(deprecationError));
    },
    signatureRequest(): Promise<never> {
      return Promise.reject(new Error(deprecationError));
    },
    structuredDataSignatureRequest(): Promise<never> {
      return Promise.reject(new Error(deprecationError));
    },
    transactionRequest(): Promise<never> {
      return Promise.reject(new Error(deprecationError));
    },
    psbtRequest(): Promise<never> {
      return Promise.reject(new Error(deprecationError));
    },
  };
}
