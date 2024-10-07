import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { accountDisplayPreferencesKeyedByType } from '@leather.io/constants';
import { AccountDisplayPreference } from '@leather.io/models';
import { Cell, PackageSecurityIcon, SheetRef } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import { SettingsSheetLayout } from '../settings-sheet.layout';

interface AccountIdentifierSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AccountIdentifierSheet({ sheetRef }: AccountIdentifierSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateAccountDisplayPreference(identifier: AccountDisplayPreference) {
    settings.changeAccountDisplayPreference(identifier);
    displayToast({ title: t`Account identifier updated`, type: 'success' });
  }

  return (
    <SettingsSheetLayout
      icon={<PackageSecurityIcon />}
      sheetRef={sheetRef}
      title={t`Account identifier`}
    >
      {Object.values(accountDisplayPreferencesKeyedByType).map(accountDisplayPref => {
        const blockchain = capitalize(i18n._(accountDisplayPref.blockchain));
        return (
          <>
            <Cell.Root
              title={i18n._(accountDisplayPref.name)}
              caption={t`${blockchain} blockchain`}
              onPress={() => onUpdateAccountDisplayPreference(accountDisplayPref.type)}
            >
              <Cell.Radio
                isSelected={settings.accountDisplayPreference.type === accountDisplayPref.type}
              />
            </Cell.Root>
          </>
        );
      })}
    </SettingsSheetLayout>
  );
}
