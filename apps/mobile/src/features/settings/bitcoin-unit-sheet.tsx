import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useBrowser } from '@/core/browser-provider';
import { LEATHER_GUIDES_MOBILE_BITCOIN_UNIT } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { bitcoinUnitsKeyedByName } from '@leather.io/constants';
import { BitcoinUnit } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface BitcoinUnitSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function BitcoinUnitSheet({ sheetRef }: BitcoinUnitSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();
  const { linkingRef } = useBrowser();

  function onUpdateBitcoinUnit(unit: BitcoinUnit) {
    settings.changeBitcoinUnitPreference(unit);
    displayToast({
      title: t({
        id: 'bitcoin_unit.toast_title',
        message: 'Bitcoin unit updated',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      sheetRef={sheetRef}
      title={t({
        id: 'bitcoin_unit.header_title',
        message: 'Bitcoin unit',
      })}
      onPressSupport={() => linkingRef.current?.openURL(LEATHER_GUIDES_MOBILE_BITCOIN_UNIT)}
    >
      <SettingsList gap="0">
        {Object.values(bitcoinUnitsKeyedByName).map(unit => (
          <SettingsListItem
            key={unit.name}
            title={i18n._({
              id: 'bitcoin_unit.cell_title',
              message: '{symbol}',
              values: { symbol: unit.symbol },
            })}
            caption={i18n._({
              id: 'bitcoin_unit.cell_caption',
              message: '{name}',
              values: { name: unit.name },
            })}
            onPress={() => onUpdateBitcoinUnit(unit.name)}
            type="radio"
            isRadioSelected={settings.bitcoinUnitPreference.name === unit.name}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
