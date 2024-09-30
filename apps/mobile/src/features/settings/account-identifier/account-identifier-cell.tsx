import { Pressable } from 'react-native';

import { t } from '@lingui/macro';

import { AccountDisplayPreference, AccountDisplayPreferenceInfo } from '@leather.io/models';
import { ItemLayout, RadioButton } from '@leather.io/ui/native';

interface AccountIdentifierCellProps {
  activeAccountDisplayPreference: AccountDisplayPreference;
  accountDisplayPref: AccountDisplayPreferenceInfo;
  caption: string;

  onUpdateAccountDisplayPreference(identifier: AccountDisplayPreference): void;
  title: string;
}
export function AccountIdentifierCell({
  activeAccountDisplayPreference,
  accountDisplayPref,
  caption,
  onUpdateAccountDisplayPreference,
  title,
}: AccountIdentifierCellProps) {
  return (
    <Pressable onPress={() => onUpdateAccountDisplayPreference(accountDisplayPref.type)}>
      <ItemLayout
        actionIcon={
          <RadioButton
            disabled
            isSelected={activeAccountDisplayPreference === accountDisplayPref.type}
          />
        }
        captionLeft={t`${caption} blockchain`}
        titleLeft={title}
      />
    </Pressable>
  );
}
