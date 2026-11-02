import { type CSSProperties, memo } from 'react';
import { type TextStyle, View } from 'react-native';

import { useTheme } from '@shopify/restyle';
import { Highlight, type PrismTheme } from 'prism-react-renderer';

import { type Theme } from '../../theme-native';
import { Text } from '../text/text.native';
import { Prism, type PrismType } from './clarity-prism.shared';
import { type Language } from './utils.shared';

interface HighlighterProps {
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

function toTextStyle(style: CSSProperties | undefined): TextStyle | undefined {
  if (!style) return undefined;
  return { color: style.color };
}

export const Highlighter = memo(({ code, language = 'clarity' }: HighlighterProps) => {
  const theme = useTheme<Theme>();
  return (
    <Highlight theme={getPrismTheme(theme)} code={code} language={language} prism={Prism}>
      {({ tokens, getLineProps, getTokenProps }) => {
        return (
          <View>
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i });
              return (
                <Text key={i} style={toTextStyle(lineProps.style)}>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token, key });
                    return (
                      <Text variant="code" key={key} style={toTextStyle(tokenProps.style)}>
                        {tokenProps.children}
                      </Text>
                    );
                  })}
                </Text>
              );
            })}
          </View>
        );
      }}
    </Highlight>
  );
});

Highlighter.displayName = 'Highlighter';
