import { TransactionErrorKey } from '@leather.io/models';

export type StacksErrorKey =
  | TransactionErrorKey
  | 'InvalidSameAddress'
  | 'UnknownBalance'
  | 'UnknownFee'
  | 'UnknownAmount';

export class StacksError extends Error {
  public message: StacksErrorKey;
  constructor(message: StacksErrorKey) {
    super(message);
    this.name = 'StacksError';
    this.message = message;

    // Fix the prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
