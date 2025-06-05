import { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppByOrigin } from '@/store/apps/apps.read';
import { useTheme } from '@shopify/restyle';

import { RpcErrorCode, RpcResponses, createRpcErrorResponse } from '@leather.io/rpc';
import { Sheet, SheetInstance } from '@leather.io/ui/native';

import { BrowserApprover } from './browser-approver';
import { BrowserMessage, RpcErrorMessage } from './utils';

interface ApproverSheetProps {
  request: BrowserMessage;
  sendResult(result: RpcResponses): void;
  origin: string;
}

export function ApproverSheet(props: ApproverSheetProps) {
  const approverSheetRef = useRef<SheetInstance>(null);
  const app = useAppByOrigin(props.origin);
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const theme = useTheme();

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

  if (!app) return null;

  return (
    <Sheet
      enableDynamicSizing={false}
      snapPoints={[height - top - theme.spacing['5']]}
      ref={approverSheetRef}
    >
      <BrowserApprover app={app} closeApprover={closeApprover} {...props} />
    </Sheet>
  );
}
