import { Flex, styled } from 'leather-styles/jsx';

import { vaultThemes } from '../../multisig-tokens';

interface ThemePickerProps {
  themeId: number;
  onChange(themeId: number): void;
}

export function ThemePicker({ themeId, onChange }: ThemePickerProps) {
  return (
    <Flex gap="space.03">
      {vaultThemes.map(theme => {
        const selected = theme.id === themeId;
        return (
          <styled.button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            aria-label={theme.name}
            aria-pressed={selected}
            width="48px"
            height="48px"
            borderRadius="md"
            cursor="pointer"
            borderWidth="2px"
            borderStyle="solid"
            borderColor={selected ? 'ink.action-primary-default' : 'transparent'}
            style={{ background: theme.background }}
          />
        );
      })}
    </Flex>
  );
}
