export type TransactionErrorKey = 'InvalidAddress' | 'InsufficientFunds' | 'InvalidNetworkAddress';

export type StacksErrorKey = TransactionErrorKey | 'InvalidSameAddress';

export class StacksError extends Error {
  public message: StacksErrorKey;
  constructor(message: StacksErrorKey) {
    super(message);
    this.name = 'BitcoinError';
    this.message = message;

    // Fix the prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}