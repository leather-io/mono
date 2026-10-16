import type { ApprovalAccountIconName } from './approval-account-icon';
import type { ApprovalIdentityContext } from './approval-identity-context';

type ApprovalNetworkId = 'mainnet' | 'testnet' | 'testnet4' | 'signet' | 'devnet';

export interface ApprovalNetwork {
  id: ApprovalNetworkId;
  name: string;
}

type ApprovalSigner = 'software' | 'ledger';

interface ApprovalVault {
  name: string;
  threshold: string;
  address: string;
}

interface ApprovalBalance {
  amount: string;
  symbol: string;
  fiat?: string;
}

export interface ApprovalAccount {
  name: string;
  balance?: ApprovalBalance;
  index: number;
  address: string;
  icon: ApprovalAccountIconName;
  signer: ApprovalSigner;
  vault?: ApprovalVault;
}

type ApprovalConnection = 'connected' | 'not-connected';

type ApprovalTransport = 'walletconnect';

export interface ApprovalRequester {
  context?: ApprovalIdentityContext;
  origin: string;
  frameOrigin?: string;
  connection: ApprovalConnection;
  transport?: ApprovalTransport;
}
