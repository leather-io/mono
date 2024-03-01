import { ThemeVars } from '@storybook/theming';
import { create } from '@storybook/theming/create';

const theme: ThemeVars = create({
  base: 'dark',
  brandTitle: 'Leather Storybook',
  brandUrl: 'https://leather.io',
  brandImage: 'assets/images/leather.png',
  brandTarget: '_self',
});

export default theme;
