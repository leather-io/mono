import { memo } from 'react';

import { Box, Flex } from 'leather-styles/jsx';
import { Highlight } from 'prism-react-renderer';

import type { PrismType } from './clarity-prism.shared';
import { startPad } from './start-pad.shared';
import {
  GetGrammaticalTokenProps,
  GrammaticalToken,
  Language,
  RenderProps,
  theme,
} from './utils.shared';

const lineNumberWidth = 60;
function getLineNumber(n: number, length: number) {
  return startPad(n + 1, length.toString().length);
}

function Tokens({
  tokens,
  getTokenProps,
  showLineNumbers,
  ...rest
}: {
  tokens: GrammaticalToken[];
  getTokenProps: GetGrammaticalTokenProps<'web'>;
  showLineNumbers?: boolean;
}) {
  const pl = `calc(${showLineNumbers ? lineNumberWidth : '0'}px + 16px`;

  return (
    <Box pl={pl} pr="space.04" position="relative" zIndex={2} {...rest}>
      {tokens.map((token, i) => (
        <Box key={i} py="space.01" display="inline-block" {...getTokenProps({ token, i })} />
      ))}
    </Box>
  );
}

function LineNumber({ number, length, ...rest }: { number: number; length: number }) {
  return (
    <Flex
      textAlign="right"
      pr="space.04"
      pl="space.04"
      width={lineNumberWidth}
      borderRight="1px solid"
      borderRightColor="inherit"
      color="ink.text-subdued"
      flexShrink={0}
      style={{ userSelect: 'none' }}
      position="absolute"
      left={0}
      height="100%"
      align="baseline"
      justify="center"
      zIndex={1}
      {...rest}
    >
      {getLineNumber(number, length)}
    </Flex>
  );
}

function Line({
  tokens,
  getTokenProps,
  index,
  length,
  showLineNumbers,
  hideLineHover,
  ...rest
}: {
  tokens: GrammaticalToken[];
  index: number;
  length: number;
  getTokenProps: GetGrammaticalTokenProps<'web'>;
  showLineNumbers?: boolean;
  hideLineHover?: boolean;
}) {
  return (
    <Flex
      height="space.05"
      align="baseline"
      borderColor="ink.border-default"
      _hover={
        hideLineHover
          ? undefined
          : {
              bg: ['unset', 'unset', 'ink.background-secondary'],
              borderColor: ['ink.text-primary', 'ink.text-primary', 'ink.text-subdued'],
            }
      }
      position="relative"
      {...rest}
    >
      {showLineNumbers ? <LineNumber number={index} length={length} /> : null}
      <Tokens showLineNumbers={showLineNumbers} getTokenProps={getTokenProps} tokens={tokens} />
    </Flex>
  );
}

function Lines({
  tokens: lines,
  getLineProps,
  getTokenProps,
  className,
  showLineNumbers,
  hideLineHover,
}: { showLineNumbers?: boolean; hideLineHover?: boolean } & RenderProps<'web'>) {
  return (
    <Box display="block" className={className}>
      <Box display="block" style={{ fontFamily: 'Fira Code' }}>
        {lines.map((tokens: GrammaticalToken[], i: number) => (
          <Line
            index={i}
            key={i}
            tokens={tokens}
            getTokenProps={getTokenProps}
            length={lines.length + 1}
            showLineNumbers={showLineNumbers}
            hideLineHover={hideLineHover || lines.length < 3}
            {...getLineProps({ line: tokens, key: i })}
          />
        ))}
      </Box>
    </Box>
  );
}

export interface HighlighterProps {
  code: string;
  language?: Language;
  showLineNumbers?: boolean;
  hideLineHover?: boolean;
  prism: PrismType;
}

export const Highlighter = memo(
  ({ code, language = 'clarity', showLineNumbers, hideLineHover, prism }: HighlighterProps) => {
    return (
      <Highlight theme={theme} code={code} language={language} prism={prism as any}>
        {props => (
          <Lines showLineNumbers={showLineNumbers} hideLineHover={hideLineHover} {...props} />
        )}
      </Highlight>
    );
  }
);

Highlighter.displayName = 'Highlighter';
