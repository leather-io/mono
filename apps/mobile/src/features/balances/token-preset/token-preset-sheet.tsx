import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { SettingsSheetLayout } from '@/features/settings/settings-sheet.layout';
import { useSettings } from '@/store/settings/settings';
import { TokenPreset, tokenPresets } from '@/store/settings/utils';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

export function getTokenPresetLabel(preset: TokenPreset) {
  switch (preset) {
    case 'gasOnly':
      return { title: t`Gas only`, caption: t`BTC, STX` };
    case 'mainTokens':
      return { title: t`Main tokens`, caption: t`BTC, STX, sBTC, USDCx` };
    case 'allPricedTokens':
      return { title: t`All priced tokens`, caption: t`Same as the extension` };
    default:
      return assertUnreachable(preset);
  }
}

interface TokenPresetSheetProps {
  sheetRef: SheetRef;
}
export function TokenPresetSheet({ sheetRef }: TokenPresetSheetProps) {
  const { tokenPreset, changeTokenPreset } = useSettings();

  return (
    <SettingsSheetLayout sheetRef={sheetRef} title={t`Default set`}>
      <SettingsList gap="0">
        {tokenPresets.map(preset => {
          const label = getTokenPresetLabel(preset);
          return (
            <SettingsListItem
              key={preset}
              title={label.title}
              caption={label.caption}
              onPress={() => {
                changeTokenPreset(preset);
                sheetRef.current?.dismiss();
              }}
              type="radio"
              isRadioSelected={tokenPreset === preset}
            />
          );
        })}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
