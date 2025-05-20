import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { currencyNameMap } from '@leather.io/constants';
import { QuoteCurrency } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';

import { useBtcConversionUnitFlag } from '../feature-flags';
import { SettingsSheetLayout } from './settings-sheet.layout';

interface ConversionUnitSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function ConversionUnitSheet({ sheetRef }: ConversionUnitSheetProps) {
  const btcConversionUnitFlag = useBtcConversionUnitFlag();
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateConversionUnit(unit: QuoteCurrency) {
    settings.changeQuoteCurrencyPreference(unit);
    displayToast({
      title: t({
        id: 'conversion_unit.toast_title',
        message: 'Conversion unit updated',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      sheetRef={sheetRef}
      title={t({
        id: 'conversion_unit.header_title',
        message: 'Conversion unit',
      })}
    >
      <SettingsList gap="0">
        {Object.entries(currencyNameMap)
          .filter(([symbol]) => btcConversionUnitFlag || symbol !== 'BTC')
          .map(([symbol, name]) => (
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
              isRadioSelected={settings.quoteCurrencyPreference === symbol}
            />
          ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
