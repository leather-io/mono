import { StacksProvider } from '@stacks/connect';
import {
  FinishedTxPayload,
  PsbtData,
  SignatureData,
  SponsoredFinishedTxPayload,
} from '@stacks/connect-jwt';
import { PublicProfile } from '@stacks/profile';

import type { Platform } from './types';

/**
 * Inpage Script (LeatherProvider) <-> Content Script
 */
enum DomEventName {
  request = 'request',
  authenticationRequest = 'hiroWalletStacksAuthenticationRequest',
  signatureRequest = 'hiroWalletSignatureRequest',
  structuredDataSignatureRequest = 'hiroWalletStructuredDataSignatureRequest',
  transactionRequest = 'hiroWalletStacksTransactionRequest',
  profileUpdateRequest = 'hiroWalletProfileUpdateRequest',
  psbtRequest = 'hiroWalletPsbtRequest',
}

interface AuthenticationRequestEventDetails {
  authenticationRequest: string;
}

interface SignatureRequestEventDetails {
  signatureRequest: string;
}

interface TransactionRequestEventDetails {
  transactionRequest: string;
}

interface ProfileUpdateRequestEventDetails {
  profileUpdateRequest: string;
}

interface PsbtRequestEventDetails {
  psbtRequest: string;
}

const MESSAGE_SOURCE = 'stacks-wallet';

enum ExternalMethods {
  transactionRequest = 'hiroWalletTransactionRequest',
  transactionResponse = 'hiroWalletTransactionResponse',
  authenticationRequest = 'hiroWalletAuthenticationRequest',
  authenticationResponse = 'hiroWalletAuthenticationResponse',
  signatureRequest = 'hiroWalletSignatureRequest',
  signatureResponse = 'hiroWalletSignatureResponse',
  structuredDataSignatureRequest = 'hiroWalletStructuredDataSignatureRequest',
  structuredDataSignatureResponse = 'hiroWalletStructuredDataSignatureResponse',
  profileUpdateRequest = 'hiroWalletProfileUpdateRequest',
  profileUpdateResponse = 'hiroWalletProfileUpdateResponse',
  psbtRequest = 'hiroWalletPsbtRequest',
  psbtResponse = 'hiroWalletPsbtResponse',
}

enum InternalMethods {
  RequestDerivedStxAccounts = 'RequestDerivedStxAccounts',
  OriginatingTabClosed = 'OriginatingTabClosed',
  AccountChanged = 'AccountChanged',
  AddressMonitorUpdated = 'AddressMonitorUpdated',
}

type ExtensionMethods = ExternalMethods | InternalMethods;

interface BaseMessage {
  source: typeof MESSAGE_SOURCE;
  method: ExtensionMethods;
}

/**
 * Content Script <-> Background Script
 */
interface Message<Methods extends ExtensionMethods, Payload = undefined> extends BaseMessage {
  method: Methods;
  payload: Payload;
}

type AuthenticationResponseMessage = Message<
  ExternalMethods.authenticationResponse,
  {
    authenticationRequest: string;
    authenticationResponse: string;
  }
>;

type SignatureResponseMessage = Message<
  ExternalMethods.signatureResponse,
  {
    signatureRequest: string;
    signatureResponse: SignatureData | string;
  }
>;

type ProfileUpdateResponseMessage = Message<
  ExternalMethods.profileUpdateResponse,
  {
    profileUpdateRequest: string;
    profileUpdateResponse: PublicProfile | string;
  }
>;

type PsbtResponseMessage = Message<
  ExternalMethods.psbtResponse,
  {
    psbtRequest: string;
    psbtResponse: PsbtData | string;
  }
>;

type TxResult = SponsoredFinishedTxPayload | FinishedTxPayload;

type TransactionResponseMessage = Message<
  ExternalMethods.transactionResponse,
  {
    transactionRequest: string;
    transactionResponse: TxResult | string;
  }
>;

type LegacyMessageToContentScript =
  | AuthenticationResponseMessage
  | TransactionResponseMessage
  | SignatureResponseMessage
  | ProfileUpdateResponseMessage
  | PsbtResponseMessage;

function isValidEvent(event: MessageEvent, method: LegacyMessageToContentScript['method']) {
  const { data } = event;
  const correctSource = data.source === MESSAGE_SOURCE;
  const correctMethod = data.method === method;
  return correctSource && correctMethod && !!data.payload;
}

type CallableMethods = keyof typeof ExternalMethods;

interface ExtensionResponse {
  source: 'blockstack-extension';
  method: CallableMethods;
  [key: string]: any;
}

async function callAndReceive(
  methodName: CallableMethods | 'getURL',
  opts: any = {}
): Promise<ExtensionResponse> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      reject('Unable to get response from Blockstack extension');
    }, 1000);
    function waitForResponse(event: MessageEvent) {
      if (
        event.data.source === 'blockstack-extension' &&
        event.data.method === `${methodName}Response`
      ) {
        clearTimeout(timeout);
        window.removeEventListener('message', waitForResponse);
        resolve(event.data);
      }
    }
    window.addEventListener('message', waitForResponse);
    window.postMessage(
      {
        method: methodName,
        source: 'blockstack-app',
        ...opts,
      },
      window.location.origin
    );
  });
}

type LegacyRequests = Omit<StacksProvider, 'request' | 'getProductInfo'>;

function placeholderLegacyRequests(): LegacyRequests {
  return {
    getURL: () => {
      // TODO: deprecated
      throw new Error('This function i deprecated');
    },
    structuredDataSignatureRequest: () => {
      // TODO: deprecated
      throw new Error('This function is deprecated');
    },

    signatureRequest: () => {
      // TODO: deprecated
      throw new Error('This function is deprecated');
    },

    authenticationRequest: () => {
      // TODO: deprecated
      throw new Error('This function is deprecated');
    },

    transactionRequest: () => {
      // TODO: deprecated
      throw new Error('This function is deprecated');
    },
    psbtRequest: () => {
      // TODO: deprecated
      throw new Error('This function is deprecated');
    },
    profileUpdateRequest: () => {
      // TODO: deprecated
      throw new Error('This function is deprecated');
    },
  };
}

function legacyRequests(): LegacyRequests {
  return {
    getURL: async () => {
      const { url } = await callAndReceive('getURL');
      return url;
    },
    structuredDataSignatureRequest: async signatureRequest => {
      const event = new CustomEvent<SignatureRequestEventDetails>(
        DomEventName.structuredDataSignatureRequest,
        {
          detail: { signatureRequest },
        }
      );
      document.dispatchEvent(event);
      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<SignatureResponseMessage>) {
          if (!isValidEvent(event, ExternalMethods.signatureResponse)) return;
          if (event.data.payload?.signatureRequest !== signatureRequest) return;
          window.removeEventListener('message', handleMessage);
          if (event.data.payload.signatureResponse === 'cancel') {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(event.data.payload.signatureResponse);
            return;
          }
          if (typeof event.data.payload.signatureResponse !== 'string') {
            resolve(event.data.payload.signatureResponse);
          }
        }
        window.addEventListener('message', handleMessage);
      });
    },

    signatureRequest: async signatureRequest => {
      const event = new CustomEvent<SignatureRequestEventDetails>(DomEventName.signatureRequest, {
        detail: { signatureRequest },
      });
      document.dispatchEvent(event);
      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<SignatureResponseMessage>) {
          if (!isValidEvent(event, ExternalMethods.signatureResponse)) return;
          if (event.data.payload?.signatureRequest !== signatureRequest) return;
          window.removeEventListener('message', handleMessage);
          if (event.data.payload.signatureResponse === 'cancel') {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(event.data.payload.signatureResponse);
            return;
          }
          if (typeof event.data.payload.signatureResponse !== 'string') {
            resolve(event.data.payload.signatureResponse);
          }
        }
        window.addEventListener('message', handleMessage);
      });
    },

    authenticationRequest: async authenticationRequest => {
      // eslint-disable-next-line no-console
      console.warn(`
        WARNING: Legacy Leather request detected

        Leather now uses an RPC-style API, that can be used directly,
        rather than through libraries such as Stacks Connect. For example,
        to get a user's addresses, you should use the
        LeatherProvider.request('getAddresses') method.

        See our docs for more information https://leather.gitbook.io/
      `);
      const event = new CustomEvent<AuthenticationRequestEventDetails>(
        DomEventName.authenticationRequest,
        {
          detail: { authenticationRequest },
        }
      );
      document.dispatchEvent(event);
      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<AuthenticationResponseMessage>) {
          if (!isValidEvent(event, ExternalMethods.authenticationResponse)) return;
          if (event.data.payload?.authenticationRequest !== authenticationRequest) return;
          window.removeEventListener('message', handleMessage);
          if (event.data.payload.authenticationResponse === 'cancel') {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(event.data.payload.authenticationResponse);
            return;
          }
          resolve(event.data.payload.authenticationResponse);
        }
        window.addEventListener('message', handleMessage);
      });
    },

    transactionRequest: async transactionRequest => {
      const event = new CustomEvent<TransactionRequestEventDetails>(
        DomEventName.transactionRequest,
        {
          detail: { transactionRequest },
        }
      );
      document.dispatchEvent(event);
      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<TransactionResponseMessage>) {
          if (!isValidEvent(event, ExternalMethods.transactionResponse)) return;
          if (event.data.payload?.transactionRequest !== transactionRequest) return;
          window.removeEventListener('message', handleMessage);
          if (event.data.payload.transactionResponse === 'cancel') {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(event.data.payload.transactionResponse);
            return;
          }
          if (typeof event.data.payload.transactionResponse !== 'string') {
            resolve(event.data.payload.transactionResponse);
          }
        }
        window.addEventListener('message', handleMessage);
      });
    },
    psbtRequest: async psbtRequest => {
      const event = new CustomEvent<PsbtRequestEventDetails>(DomEventName.psbtRequest, {
        detail: { psbtRequest },
      });
      document.dispatchEvent(event);
      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<PsbtResponseMessage>) {
          if (!isValidEvent(event, ExternalMethods.psbtResponse)) return;
          if (event.data.payload?.psbtRequest !== psbtRequest) return;
          window.removeEventListener('message', handleMessage);
          if (event.data.payload.psbtResponse === 'cancel') {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(event.data.payload.psbtResponse);
            return;
          }
          if (typeof event.data.payload.psbtResponse !== 'string') {
            resolve(event.data.payload.psbtResponse);
          }
        }
        window.addEventListener('message', handleMessage);
      });
    },
    profileUpdateRequest: async profileUpdateRequest => {
      const event = new CustomEvent<ProfileUpdateRequestEventDetails>(
        DomEventName.profileUpdateRequest,
        {
          detail: { profileUpdateRequest },
        }
      );
      document.dispatchEvent(event);
      return new Promise((resolve, reject) => {
        function handleMessage(event: MessageEvent<ProfileUpdateResponseMessage>) {
          if (!isValidEvent(event, ExternalMethods.profileUpdateResponse)) return;
          if (event.data.payload?.profileUpdateRequest !== profileUpdateRequest) return;
          window.removeEventListener('message', handleMessage);
          if (event.data.payload.profileUpdateResponse === 'cancel') {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(event.data.payload.profileUpdateResponse);
            return;
          }
          if (typeof event.data.payload.profileUpdateResponse !== 'string') {
            resolve(event.data.payload.profileUpdateResponse);
          }
        }
        window.addEventListener('message', handleMessage);
      });
    },
  };
}

export function getLegacyRequests(platform: Platform) {
  switch (platform) {
    case 'extension':
      return legacyRequests();
    case 'mobile':
    default:
      return placeholderLegacyRequests();
  }
}
