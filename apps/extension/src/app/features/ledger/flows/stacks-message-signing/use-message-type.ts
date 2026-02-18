import { useSelector } from 'react-redux';

import { hexToBytes } from '@stacks/common';

import { isString } from '@leather.io/utils';

import {
  type UnsignedMessage,
  deserializeUnsignedMessage,
} from '@shared/signature/signature-types';

import type { RootState } from '@app/store';

export function useUnsignedMessageType(): UnsignedMessage | null {
  const messageType = useSelector((state: RootState) => state.navigation.ledger.messageType);
  const message = useSelector((state: RootState) => state.navigation.ledger.message);
  const domain = useSelector((state: RootState) => state.navigation.ledger.domain);

  if (messageType === 'utf8' && isString(message)) return { messageType, message };

  if (messageType === 'structured' && message && domain)
    return deserializeUnsignedMessage({
      messageType,
      message: hexToBytes(message),
      domain: new Uint8Array(domain),
    });

  return null;
}
