type SignFn<T> = (tx: T, ...args: unknown[]) => Promise<T>;

export interface Signer {
  sign: SignFn<any>;
  address: string;
  publicKey: Uint8Array;
  derivationPath: string;
}
