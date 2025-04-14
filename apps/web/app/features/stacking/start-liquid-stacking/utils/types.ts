import { ProtocolName } from './types-preset-protocols';

export interface LiquidStackingFormValues {
  amount: number;
  stxAddress: string;
  protocolName: ProtocolName | undefined;
}
