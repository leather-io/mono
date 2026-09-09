import {
  isExtensionVersionSupported,
  minSupportedExtensionVersion,
  readExtensionVersion,
} from './extension-version';

export class OutdatedExtensionError extends Error {
  readonly installedVersion: string;

  constructor(installedVersion: string) {
    super(
      `Leather extension ${installedVersion} is out of date. Update to ${minSupportedExtensionVersion} or newer to use Multisig.`
    );
    this.name = 'OutdatedExtensionError';
    this.installedVersion = installedVersion;
  }
}

interface GatedClientOptions {
  getProvider(): unknown;
  onOutdated(installedVersion: string): void;
}

// Wraps every method of a Leather SDK client so the installed extension's
// version is checked before each RPC call. Too-old extensions are reported via
// onOutdated and the call rejects with OutdatedExtensionError.
export function createGatedLeatherClient<Client extends object>(
  client: Client,
  { getProvider, onOutdated }: GatedClientOptions
): Client {
  return new Proxy(client, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver);
      if (typeof value !== 'function') return value;
      return async (...args: unknown[]) => {
        const installedVersion = readExtensionVersion(getProvider());
        if (installedVersion !== null && !isExtensionVersionSupported(installedVersion)) {
          onOutdated(installedVersion);
          throw new OutdatedExtensionError(installedVersion);
        }
        const result: unknown = await Reflect.apply(value, target, args);
        return result;
      };
    },
  });
}
