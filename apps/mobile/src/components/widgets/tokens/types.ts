import { Money } from '@leather.io/models';

export interface Token {
  availableBalance: Record<string, Money>;
  ticker: string;
  fiatBalance: Money;
  tokenName: string;
  chain: string;
}
