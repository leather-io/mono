import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { currencyNameMap } from '@leather.io/constants';
import { QuoteCurrency } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface ConversionUnitSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function ConversionUnitSheet({ sheetRef }: ConversionUnitSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateConversionUnit(unit: QuoteCurrency) {
    settings.changeQuoteCurrencyPreference(unit);
    displayToast({
      title: t`Conversion unit updated`,
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout sheetRef={sheetRef} title={t`Conversion unit`}>
      <SettingsList gap="0">
        {Object.entries(currencyNameMap).map(([symbol, name]) => (
          <SettingsListItem
            key={symbol}
            title={i18n._({
              id: 'conversion_unit.cell_title',
              message: '{name}',
              values: { name },
            })}
            caption={i18n._({
              id: 'conversion_unit.cell_caption',
              message: '{symbol}',
              values: { symbol },
            })}
            onPress={() => onUpdateConversionUnit(symbol)}
            type="radio"
            isRadioSelected={settings.fiatCurrencyPreference === symbol}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
