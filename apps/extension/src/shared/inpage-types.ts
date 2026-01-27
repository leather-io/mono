/**
 * Inpage Script (LeatherProvider) <-> Content Script
 */
export enum DomEventName {
  request = 'request',
  authenticationRequest = 'hiroWalletStacksAuthenticationRequest',
  signatureRequest = 'hiroWalletSignatureRequest',
  structuredDataSignatureRequest = 'hiroWalletStructuredDataSignatureRequest',
  transactionRequest = 'hiroWalletStacksTransactionRequest',
  psbtRequest = 'hiroWalletPsbtRequest',
}

interface AuthenticationRequestEventDetails {
  authenticationRequest: string;
}

export type AuthenticationRequestEvent = CustomEvent<AuthenticationRequestEventDetails>;

interface SignatureRequestEventDetails {
  signatureRequest: string;
}

export type SignatureRequestEvent = CustomEvent<SignatureRequestEventDetails>;

interface TransactionRequestEventDetails {
  transactionRequest: string;
}

export type TransactionRequestEvent = CustomEvent<TransactionRequestEventDetails>;

interface PsbtRequestEventDetails {
  psbtRequest: string;
}

export type PsbtRequestEvent = CustomEvent<PsbtRequestEventDetails>;
