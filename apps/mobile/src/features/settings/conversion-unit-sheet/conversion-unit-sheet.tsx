import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { currencyNameMap } from '@leather.io/constants';
import { FiatCurrency } from '@leather.io/models';
import { Cell, DollarCircleIcon, SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from '../settings-sheet.layout';

interface ConversionUnitSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function ConversionUnitSheet({ sheetRef }: ConversionUnitSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateConversionUnit(unit: FiatCurrency) {
    settings.changeFiatCurrencyPreference(unit);
    displayToast({ title: t`Conversion unit updated`, type: 'success' });
  }

  return (
    <SettingsSheetLayout icon={<DollarCircleIcon />} sheetRef={sheetRef} title={t`Conversion unit`}>
      {Object.entries(currencyNameMap).map(([symbol, name]) => (
        <Cell.Root
          key={symbol}
          title={i18n._(name)}
          caption={symbol}
          onPress={() => onUpdateConversionUnit(symbol)}
        >
          <Cell.Radio isSelected={settings.fiatCurrencyPreference === symbol} />
        </Cell.Root>
      ))}
    </SettingsSheetLayout>
  );
}
