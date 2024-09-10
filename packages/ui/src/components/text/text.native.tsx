import { createText as createRestyleText } from '@shopify/restyle';

import { Theme } from '../../theme-native';

function createLeatherText() {
  const RestyleText = createRestyleText<Theme>();
  type TextProps = Parameters<typeof RestyleText>['0'];

  const defaults = {
    color: 'ink.text-primary',
  } satisfies Partial<TextProps>;

  return function Text(props: TextProps) {
    return <RestyleText {...defaults} {...props} />;
  };
}

export const Text = createLeatherText();
export type TextProps = Parameters<typeof Text>['0'];
