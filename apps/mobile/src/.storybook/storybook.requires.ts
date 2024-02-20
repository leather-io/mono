/* do not change this file, it is auto generated by storybook. */
import '@storybook/addon-ondevice-actions/register';
import '@storybook/addon-ondevice-controls/register';
import { start } from '@storybook/react-native';

const normalizedStories = [
  {
    titlePrefix: '',
    directory: './components',
    files: '**/*.stories.?(ts|tsx|js|jsx)',
    importPathMatcher:
      /^\.(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.).)*?)\/)(?!\.)(?=.)[^/]*?\.stories\.(?:ts|tsx|js|jsx)?)$/,
    // @ts-ignore
    req: require.context(
      '../components',
      true,
      /^\.(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.).)*?)\/)(?!\.)(?=.)[^/]*?\.stories\.(?:ts|tsx|js|jsx)?)$/
    ),
  },
];

// @ts-ignore
global.STORIES = normalizedStories;

export const view = start({
  annotations: [
    require('./preview'),
    require('@storybook/react-native/dist/preview'),
    require('@storybook/addon-actions/preview'),
  ],
  storyEntries: normalizedStories,
});
