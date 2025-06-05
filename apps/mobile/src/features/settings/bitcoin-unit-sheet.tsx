import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { LEATHER_GUIDES_MOBILE_BITCOIN_UNIT } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import { capitalize } from 'remeda';

import { bitcoinUnitsKeyedByName } from '@leather.io/constants';
import { BitcoinUnit } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';

import { useOpenURL } from '../browser/browser/use-open-url';
import { SettingsSheetLayout } from './settings-sheet.layout';

interface BitcoinUnitSheetProps {
  sheetRef: SheetRef;
}
export function BitcoinUnitSheet({ sheetRef }: BitcoinUnitSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { openURL } = useOpenURL();

  function onUpdateBitcoinUnit(unit: BitcoinUnit) {
    settings.changeBitcoinUnitPreference(unit);
    displayToast({
      title: t`Bitcoin unit updated`,
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      sheetRef={sheetRef}
      title={t`Bitcoin unit`}
      onPressSupport={() => openURL(LEATHER_GUIDES_MOBILE_BITCOIN_UNIT)}
    >
      <SettingsList gap="0">
        {Object.values(bitcoinUnitsKeyedByName).map(unit => (
          <SettingsListItem
            key={unit.name}
            title={unit.symbol}
            caption={capitalize(unit.name)}
            onPress={() => onUpdateBitcoinUnit(unit.name)}
            type="radio"
            isRadioSelected={settings.bitcoinUnitPreference.name === unit.name}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
