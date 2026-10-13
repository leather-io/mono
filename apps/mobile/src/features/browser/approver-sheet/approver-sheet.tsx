import { type RefObject, useImperativeHandle, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useTheme } from '@shopify/restyle';

import { RpcErrorCode, RpcResponses, createRpcErrorResponse } from '@leather.io/rpc';
import { Box, type SheetInstance } from '@leather.io/ui/native';

import { BrowserApprover } from './browser-approver';
import { BrowserMessage, RpcErrorMessage } from './utils';

interface ApproverSheetProps {
  sendResult(result: RpcResponses): void;
}

export interface ApproverSheetInstance {
  present(request: BrowserMessage, origin: string): void;
  dismiss(): void;
}
export type ApproverSheetRef = RefObject<ApproverSheetInstance | null>;

const sheetClosedIndex = -1;

export function ApproverSheet(props: ApproverSheetProps) {
  const { approverSheetRef } = useGlobalSheets();
  const ref = useRef<SheetInstance>(null);
  const [request, setRequest] = useState<BrowserMessage>(null);
  const [origin, setOrigin] = useState<null | string>(null);
  const animatedIndex = useSharedValue(sheetClosedIndex);

  useImperativeHandle(approverSheetRef, () => ({
    present(_request, _origin) {
      setRequest(_request);
      setOrigin(_origin);
      // if the sheet is still somewhat open, wait a little bit before opening it up again
      if (animatedIndex.value !== sheetClosedIndex) {
        setTimeout(() => {
          ref.current?.present();
        }, 500);
      } else {
        ref.current?.present();
      }
    },
    dismiss() {
      ref.current?.dismiss();
      setRequest(null);
      setOrigin(null);
    },
  }));

  const { top } = useSafeAreaInsets();
  const theme = useTheme();

  function closeApprover() {
    if (request) {
      const errorResponse = createRpcErrorResponse(request.method, {
        id: request.id,
        error: {
          code: RpcErrorCode.USER_REJECTION,
          message: RpcErrorMessage.UserRejectedOperation,
        },
      });
      props.sendResult(errorResponse);
    }
    approverSheetRef.current?.dismiss();
  }

  return (
    <FullHeightSheet animatedIndex={animatedIndex} sheetRef={ref}>
      {request && origin && (
        <Box style={{ paddingTop: top + theme.spacing['5'], flex: 1 }}>
          <BrowserApprover
            closeApprover={closeApprover}
            request={request}
            origin={origin}
            {...props}
          />
        </Box>
      )}
    </FullHeightSheet>
  );
}
