import { CSSProperties } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { token } from 'leather-styles/tokens';
import { PrismTheme } from 'prism-react-renderer';

type PrismPlatform = 'web' | 'mobile';

export interface GrammaticalToken {
  types: string[];
  content: string;
  empty?: boolean;
}

interface GrammaticalTokenOutputProps<Platform extends PrismPlatform> {
  key?: React.Key;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  className: string;
  children: string;
  [otherProp: string]: any;
}

interface GrammaticalTokenInputProps<Platform extends PrismPlatform> {
  key?: React.Key;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  className?: string;
  token: GrammaticalToken;
  [otherProp: string]: any;
}

interface LineInputProps<Platform extends PrismPlatform> {
  key?: React.Key;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  className?: string;
  line: GrammaticalToken[];
  [otherProp: string]: any;
}

interface LineOutputProps<Platform extends PrismPlatform> {
  key?: React.Key;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  className: string;
  [otherProps: string]: any;
}

export interface RenderProps<Platform extends PrismPlatform> {
  tokens: GrammaticalToken[][];
  className: string;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  getLineProps(input: LineInputProps<Platform>): LineOutputProps<Platform>;
  getTokenProps(input: GrammaticalTokenInputProps<Platform>): GrammaticalTokenOutputProps<Platform>;
}

export type GetGrammaticalTokenProps<Platform extends PrismPlatform> = (
  input: GrammaticalTokenInputProps<Platform>
) => GrammaticalTokenOutputProps<Platform>;

export type Language =
  | 'markup'
  | 'bash'
  | 'clarity'
  | 'clike'
  | 'c'
  | 'cpp'
  | 'css'
  | 'javascript'
  | 'jsx'
  | 'coffeescript'
  | 'actionscript'
  | 'css-extr'
  | 'diff'
  | 'git'
  | 'go'
  | 'graphql'
  | 'handlebars'
  | 'json'
  | 'less'
  | 'lisp'
  | 'makefile'
  | 'markdown'
  | 'objectivec'
  | 'ocaml'
  | 'python'
  | 'reason'
  | 'sass'
  | 'scss'
  | 'sql'
  | 'stylus'
  | 'tsx'
  | 'typescript'
  | 'wasm'
  | 'yaml';

export const theme: PrismTheme = {
  plain: {
    color: token('colors.ink.text-primary'),
  },
  styles: [
    {
      types: ['comment', 'punctuation'],
      style: {
        color: token('colors.ink.text-subdued'),
      },
    },
    {
      types: ['operator'],
      style: {
        color: token('colors.ink.text-primary'),
      },
    },
    {
      types: ['builtin', 'tag', 'changed', 'keyword'],
      style: {
        color: token('colors.yellow.action-primary-default'),
      },
    },
    {
      types: ['function'],
      style: {
        color: token('colors.red.action-primary-default'),
      },
    },
    {
      types: ['number', 'variable', 'inserted'],
      style: {
        color: token('colors.yellow.action-primary-default'),
      },
    },
    {
      types: ['deleted', 'string', 'symbol', 'char'],
      style: {
        color: token('colors.green.action-primary-default'),
      },
    },
  ],
};
