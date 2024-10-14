import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { accountDisplayPreferencesKeyedByType } from '@leather.io/constants';
import { AccountDisplayPreference } from '@leather.io/models';
import { Cell, PackageSecurityIcon, SheetRef } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AccountIdentifierSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AccountIdentifierSheet({ sheetRef }: AccountIdentifierSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateAccountDisplayPreference(identifier: AccountDisplayPreference) {
    settings.changeAccountDisplayPreference(identifier);
    displayToast({
      title: t({
        id: 'account_identifier.toast_title',
        message: 'Account identifier updated',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      icon={<PackageSecurityIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'account_identifier.header_title',
        message: 'Account identifier',
      })}
    >
      {Object.values(accountDisplayPreferencesKeyedByType).map(accountDisplayPref => (
        <Cell.Root
          key={accountDisplayPref.name}
          title={i18n._({
            id: 'account_identifier.cell_title',
            message: '{name}',
            values: { name: accountDisplayPref.name },
          })}
          caption={t({
            id: 'account_identifier.cell_caption',
            message: `${capitalize(i18n._(accountDisplayPref.blockchain))} blockchain`,
          })}
          onPress={() => onUpdateAccountDisplayPreference(accountDisplayPref.type)}
        >
          <Cell.Radio
            isSelected={settings.accountDisplayPreference.type === accountDisplayPref.type}
          />
        </Cell.Root>
      ))}
    </SettingsSheetLayout>
  );
}
