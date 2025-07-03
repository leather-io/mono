import { useEffect, useRef } from 'react';

import { useAppByOrigin } from '@/store/apps/apps.read';
import { useSettings } from '@/store/settings/settings';

import { RpcErrorCode, RpcResponses, createRpcErrorResponse } from '@leather.io/rpc';
import { Sheet, SheetRef } from '@leather.io/ui/native';

import { BrowserApprover } from './browser-approver';
import { BrowserMessage, RpcErrorMessage } from './utils';

interface ApproverSheetProps {
  request: BrowserMessage;
  sendResult(result: RpcResponses): void;
  origin: string;
}

export function ApproverSheet(props: ApproverSheetProps) {
  const approverSheetRef = useRef<SheetRef>(null);
  const app = useAppByOrigin(props.origin);
  function closeApprover() {
    approverSheetRef.current?.close();
    if (props.request) {
      const errorResponse = createRpcErrorResponse(props.request.method, {
        id: props.request.id,
        error: {
          code: RpcErrorCode.USER_REJECTION,
          message: RpcErrorMessage.UserRejectedOperation,
        },
      });
      props.sendResult(errorResponse);
    }
  }

  useEffect(() => {
    if (props.request === null) {
      approverSheetRef.current?.close();
    } else {
      approverSheetRef.current?.present();
    }
  }, [props.request]);

  const { themeDerivedFromThemePreference } = useSettings();
  if (!app) return null;

  return (
    <Sheet
      shouldHaveContainer={false}
      ref={approverSheetRef}
      themeVariant={themeDerivedFromThemePreference}
      snapPointVariant="fullHeightWithoutNotch"
    >
      <BrowserApprover app={app} closeApprover={closeApprover} {...props} />
    </Sheet>
  );
}
