import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { select, t } from '@lingui/core/macro';

import { currencyNameMap } from '@leather.io/constants';
import { QuoteCurrency } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface ConversionUnitSheetProps {
  sheetRef: SheetRef;
}
export function ConversionUnitSheet({ sheetRef }: ConversionUnitSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

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
            title={t({
              context: 'Currency name',
              message: select(symbol, {
                USD: 'United States Dollar',
                EUR: 'Euro',
                GBP: 'British Pound',
                AUD: 'Australian Dollar',
                CAD: 'Canadian Dollar',
                CNY: 'Chinese Yuan',
                JPY: 'Japanese Yen',
                KRW: 'South Korean Won',
                BTC: 'Bitcoin',
                other: name,
              }),
            })}
            caption={symbol}
            onPress={() => onUpdateConversionUnit(symbol)}
            type="radio"
            isRadioSelected={settings.fiatCurrencyPreference === symbol}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
