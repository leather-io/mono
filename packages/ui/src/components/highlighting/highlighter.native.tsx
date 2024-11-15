import { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@shopify/restyle';
import { Text, Theme } from 'native';
import { Highlight, PrismTheme } from 'prism-react-renderer';

import { Prism, type PrismType } from './clarity-prism.shared';
import { Language, RenderProps } from './utils.shared';

export interface HighlighterProps {
  code: string;
  language?: Language;
  showLineNumbers?: boolean;
  hideLineHover?: boolean;
  prism: PrismType;
}

function getPrismTheme(theme: Theme): PrismTheme {
  return {
    plain: {
      color: theme.colors['ink.text-primary'],
    },
    styles: [
      {
        types: ['comment', 'punctuation'],
        style: {
          color: theme.colors['ink.text-subdued'],
        },
      },
      {
        types: ['operator'],
        style: {
          color: theme.colors['ink.text-primary'],
        },
      },
      {
        types: ['builtin', 'tag', 'changed', 'keyword'],
        style: {
          color: theme.colors['yellow.action-primary-default'],
        },
      },
      {
        types: ['function'],
        style: {
          color: theme.colors['red.action-primary-default'],
        },
      },
      {
        types: ['number', 'variable', 'inserted'],
        style: {
          color: theme.colors['yellow.action-primary-default'],
        },
      },
      {
        types: ['deleted', 'string', 'symbol', 'char'],
        style: {
          color: theme.colors['green.action-primary-default'],
        },
      },
    ],
  };
}

export const Highlighter = memo(({ code, language = 'clarity' }: HighlighterProps) => {
  const theme = useTheme<Theme>();
  return (
    <Highlight theme={getPrismTheme(theme)} code={code} language={language} prism={Prism as any}>
      {({ tokens, getLineProps, getTokenProps }) => {
        return (
          <View>
            {tokens.map((line, i) => (
              <Text
                key={i}
                {...(getLineProps as RenderProps<'mobile'>['getLineProps'])({ line, key: i })}
              >
                {line.map((token, key) => (
                  <Text
                    variant="code"
                    key={key}
                    {...(getTokenProps as RenderProps<'mobile'>['getTokenProps'])({ token, key })}
                  />
                ))}
              </Text>
            ))}
          </View>
        );
      }}
    </Highlight>
  );
});
