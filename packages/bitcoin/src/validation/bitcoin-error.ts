type TransactionErrorKey = 'InvalidAddress' | 'InsufficientFunds' | 'InvalidNetworkAddress';

export class BitcoinError extends Error {
  public message: BitcoinErrorKey;
  constructor(message: BitcoinErrorKey) {
    super(message);
    this.name = 'BitcoinError';
    this.message = message;

    // Fix the prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type BitcoinErrorKey =
  | TransactionErrorKey
  | 'InsufficientAmount'
  | 'NoInputsToSign'
  | 'NoOutputsToSign';
