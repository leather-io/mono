const deprecationError =
  'This legacy method is no longer supported. Upgrade to the LeatherProvider.request() RPC API, see https://leather.gitbook.io/developers';

export function deprecatedProviderMethods() {
  return {
    getURL(): never {
      throw new Error(deprecationError);
    },
    authenticationRequest(): never {
      throw new Error(deprecationError);
    },
    signatureRequest(): never {
      throw new Error(deprecationError);
    },
    structuredDataSignatureRequest(): never {
      throw new Error(deprecationError);
    },
    transactionRequest(): never {
      throw new Error(deprecationError);
    },
    psbtRequest(): never {
      throw new Error(deprecationError);
    },
  };
}
