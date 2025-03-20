import { useEffect, useRef } from 'react';

import { useAppByOrigin } from '@/store/apps/apps.read';
import { useSettings } from '@/store/settings/settings';

import { Sheet, SheetRef } from '@leather.io/ui/native';

import { BrowserApprover } from './browser-approver';
import { BrowserMessage } from './utils';

interface ApproverSheetProps {
  message: BrowserMessage;
  sendResult(result: object): void;
  origin: string;
}

export function ApproverSheet(props: ApproverSheetProps) {
  const approverSheetRef = useRef<SheetRef>(null);
  const app = useAppByOrigin(props.origin);
  function closeApprover() {
    approverSheetRef.current?.close();
  }

  useEffect(() => {
    if (props.message === null) {
      approverSheetRef.current?.close();
    } else {
      approverSheetRef.current?.present();
    }
  }, [props.message]);

  const { themeDerivedFromThemePreference } = useSettings();
  if (!app) return null;

  return (
    <Sheet
      shouldHaveContainer={false}
      ref={approverSheetRef}
      themeVariant={themeDerivedFromThemePreference}
    >
      <BrowserApprover app={app} closeApprover={closeApprover} {...props} />
    </Sheet>
  );
}
