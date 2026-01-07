import { useCallback } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { analytics } from '@shared/utils/analytics';

import {
  type UserSelectedTheme,
  themeLabelMap,
  useThemeSwitcher,
} from '@app/common/theme-provider';
import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

import { ThemeListItem } from './components/theme-list-item';

export function SelectTheme() {
  const themes = Object.keys(themeLabelMap) as UserSelectedTheme[];

  const { setUserSelectedTheme } = useThemeSwitcher();

  const handleThemeSelected = useCallback(
    (theme: UserSelectedTheme) => {
      analytics.track(`select_theme`, {
        theme,
      });
      setUserSelectedTheme(theme);
    },
    [setUserSelectedTheme]
  );

  const { userSelectedTheme } = useThemeSwitcher();

  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>
      <Content>
        <Flex
          direction="column"
          width="100%"
          position="relative"
          justifyContent="space-between"
          height="100%"
          px="space.05"
        >
          <Flex direction="column">
            <styled.h1 textStyle="heading.03" pb="space.05">
              Theme
            </styled.h1>
            <Flex direction="column" gap="space.01">
              {themes.map(theme => (
                <ThemeListItem
                  key={theme}
                  theme={theme}
                  onThemeSelected={() => handleThemeSelected(theme)}
                  isActive={theme === userSelectedTheme}
                />
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Content>
    </Flex>
  );
}
