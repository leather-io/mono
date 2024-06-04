import { forwardRef } from 'react';

import { Box, BoxProps } from 'leather-styles/jsx';

import { Highlighter, HighlighterProps } from './highlighter.web';

type CodeBlockProps = HighlighterProps & BoxProps;

export const CodeBlock = forwardRef(
  (
    { code, showLineNumbers, hideLineHover, style = {}, language, prism, ...rest }: CodeBlockProps,
    ref: React.Ref<HTMLDivElement>
  ) => (
    <Box
      bg="invert"
      borderRadius={[0, 'lg']}
      overflowX="auto"
      p="space.04"
      ref={ref}
      style={{
        ...style,
        whiteSpace: 'pre',
        fontFamily: 'Fira Code, Consolata, monospace',
        fontSize: '14px',
      }}
      width="100%"
      {...rest}
    >
      <Highlighter
        language={language}
        code={code.toString().trim()}
        showLineNumbers={showLineNumbers}
        hideLineHover={hideLineHover}
        prism={prism}
      />
    </Box>
  )
);
