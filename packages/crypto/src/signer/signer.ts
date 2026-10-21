export interface Signer {
  sign(tx: unknown, ...args: unknown[]): Promise<unknown>;
  address: string;
  publicKey: Uint8Array;
  derivationPath: string;
}
