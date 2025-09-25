import { ComponentProps } from 'react';

import { PortableText, PortableTextComponents } from '@portabletext/react';
import { styled } from 'leather-styles/jsx';

import { contentComponents } from './content-components';

const { code: Code, a: A } = contentComponents;

// Reuse the same styles as markdownComponents
const portableTextComponents: PortableTextComponents = {
  types: {
    code: ({ value }) => <Code>{value.code}</Code>,
  },
  marks: {
    strong: contentComponents.strong,
    em: contentComponents.em,
    code: contentComponents.code,
    link({ children, value }) {
      return <A href={value?.href}>{children}</A>;
    },
  },
  block: {
    h1: contentComponents.h1,
    h2: contentComponents.h2,
    h3: contentComponents.h3,
    h4: contentComponents.h4,
    h5: contentComponents.h5,
    h6: contentComponents.h6,
    normal: contentComponents.p,

    blockquote: contentComponents.blockquote,
    code: contentComponents.code,
    pre: contentComponents.pre,
    hr: contentComponents.hr,
  },
  listItem: {
    bullet: ({ children }) => <styled.li listStyleType="disc">{children}</styled.li>,
    number: ({ children }) => <styled.li listStyleType="decimal">{children}</styled.li>,
  },
};

interface PortableTextContentProps {
  value: ComponentProps<typeof PortableText>['value'];
}
export default function PortableTextContent({ value }: PortableTextContentProps) {
  return <PortableText value={value} components={portableTextComponents} />;
}
