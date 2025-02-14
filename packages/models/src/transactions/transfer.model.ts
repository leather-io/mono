import { Money } from '../money.model';

export interface TransferRecipient {
  address: string;
  amount: Money;
}
