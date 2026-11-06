import { type CSSProperties } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

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
  [otherProp: string]: unknown;
}

interface GrammaticalTokenInputProps<Platform extends PrismPlatform> {
  key?: React.Key;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  className?: string;
  token: GrammaticalToken;
  [otherProp: string]: unknown;
}

interface LineInputProps<Platform extends PrismPlatform> {
  key?: React.Key;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  className?: string;
  line: GrammaticalToken[];
  [otherProp: string]: unknown;
}

interface LineOutputProps<Platform extends PrismPlatform> {
  key?: React.Key;
  style?: Platform extends 'mobile' ? StyleProp<TextStyle> : CSSProperties;
  className: string;
  [otherProps: string]: unknown;
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
