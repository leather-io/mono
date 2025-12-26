import { css } from 'leather-styles/css';

import { CheckmarkCircleIcon, ItemLayoutWithButtons } from '@leather.io/ui';

import { UserSelectedTheme, getThemeLabel } from '@app/common/theme-provider';

interface ThemeListItemProps {
  theme: UserSelectedTheme;
  onThemeSelected(): void;
  isActive: boolean;
}
export function ThemeListItem({ theme, onThemeSelected, isActive }: ThemeListItemProps) {
  const themeLabel = getThemeLabel(theme);

  return (
    <button
      className={css({
        _hover: {
          backgroundColor: 'ink.component-background-hover',
        },
        mx: '-space.05',
        px: 'space.05',
        py: 'space.05',
        borderRadius: 'xs',
      })}
      onClick={onThemeSelected}
    >
      <ItemLayoutWithButtons
        title={themeLabel}
        buttons={isActive ? <CheckmarkCircleIcon /> : null}
      />
    </button>
  );
}
