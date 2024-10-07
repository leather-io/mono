import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { bitcoinUnitsKeyedByName } from '@leather.io/constants';
import { BitcoinUnit } from '@leather.io/models';
import { BitcoinCircleIcon, Cell, SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from '../settings-sheet.layout';

interface BitcoinUnitSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function BitcoinUnitSheet({ sheetRef }: BitcoinUnitSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateBitcoinUnit(unit: BitcoinUnit) {
    settings.changeBitcoinUnitPreference(unit);
    displayToast({ title: t`Bitcoin unit updated`, type: 'success' });
  }

  return (
    <SettingsSheetLayout icon={<BitcoinCircleIcon />} sheetRef={sheetRef} title={t`Bitcoin unit`}>
      {Object.values(bitcoinUnitsKeyedByName).map(unit => (
        <Cell.Root
          key={unit.name}
          title={i18n._(unit.symbol)}
          caption={i18n._(unit.name)}
          onPress={() => onUpdateBitcoinUnit(unit.name)}
        >
          <Cell.Radio isSelected={settings.bitcoinUnitPreference.name === unit.name} />
        </Cell.Root>
      ))}
    </SettingsSheetLayout>
  );
}
