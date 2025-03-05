import { App } from '@/store/apps/utils';

import { getAddresses, signPsbt } from '@leather.io/rpc';

import { GetAddressesApprover } from './get-addresses/get-addresses';
import { SignPsbtApprover } from './sign-psbt';
import { BrowserMessage } from './utils';

interface BrowserApproverProps {
  message: BrowserMessage;
  sendResult(result: object): void;
  origin: string;
  app: App;
  closeApprover(): void;
}

export function BrowserApprover(props: BrowserApproverProps) {
  switch (props.message?.method) {
    case getAddresses.method:
      return (
        <GetAddressesApprover
          app={props.app}
          sendResult={props.sendResult}
          origin={props.origin}
          message={props.message}
          closeApprover={props.closeApprover}
        />
      );
    case signPsbt.method: {
      return (
        <SignPsbtApprover
          app={props.app}
          sendResult={props.sendResult}
          origin={props.origin}
          message={props.message}
          closeApprover={props.closeApprover}
        />
      );
    }
    default:
      return null;
  }
}
