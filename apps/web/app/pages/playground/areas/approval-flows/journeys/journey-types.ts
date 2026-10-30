type JourneyStepKind = 'connect' | 'message' | 'transaction' | 'proposal' | 'sign' | 'broadcast';

type JourneyCategory = 'wallet' | 'apps' | 'vaults' | 'staking' | 'generic';

export interface JourneyMovement {
  symbol: string;
  amount: string;
  direction: 'in' | 'out' | 'neutral';
  fiat?: string;
}

interface JourneyFee {
  amount: string;
  symbol: string;
}

export interface JourneyStep {
  id: string;
  kind: JourneyStepKind;
  title: string;
  primaryLabel: string;
  method: string;
  chain: 'bitcoin' | 'stacks';
  movements: JourneyMovement[];
  outcomeMovements?: JourneyMovement[];
  fee?: JourneyFee;
  functionName?: string;
  contractName?: string;
  message?: string;
  recipient?: string;
  name?: string;
  note?: string;
  protection?: string;
  waits?: string;
}

interface JourneyVariant {
  id: string;
  label: string;
  steps: JourneyStep[];
}

export interface JourneyDefinition {
  id: string;
  title: string;
  category: JourneyCategory;
  appName: string;
  origin: string;
  description: string;
  goal: string;
  sourceUrl?: string;
  steps: JourneyStep[];
  variants?: JourneyVariant[];
}
