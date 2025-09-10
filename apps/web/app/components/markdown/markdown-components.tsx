import { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import { Link } from '@leather.io/ui';

interface MarkdownComponentsProps {
  children?: ReactNode;
}

function H1({ children }: MarkdownComponentsProps) {
  return (
    <styled.h1 textStyle="heading.03" mt="space.06" mb="space.04">
      {children}
    </styled.h1>
  );
}

function H2({ children }: MarkdownComponentsProps) {
  return (
    <styled.h2 textStyle="heading.04" mt="space.05" mb="space.03">
      {children}
    </styled.h2>
  );
}

function H3({ children }: MarkdownComponentsProps) {
  return (
    <styled.h3 textStyle="heading.05" mt="space.04" mb="space.02">
      {children}
    </styled.h3>
  );
}

function H4({ children }: MarkdownComponentsProps) {
  return (
    <styled.h4 textStyle="label.01" mt="space.03" mb="space.02">
      {children}
    </styled.h4>
  );
}

function H5({ children }: MarkdownComponentsProps) {
  return (
    <styled.h5 textStyle="label.02" mt="space.03" mb="space.02">
      {children}
    </styled.h5>
  );
}

function H6({ children }: MarkdownComponentsProps) {
  return (
    <styled.h6 textStyle="label.03" mt="space.02" mb="space.02">
      {children}
    </styled.h6>
  );
}

function P({ children }: MarkdownComponentsProps) {
  return (
    <styled.p textStyle="body.02" mb="space.04" lineHeight="1.6">
      {children}
    </styled.p>
  );
}

function Ul({ children }: MarkdownComponentsProps) {
  return (
    <styled.ul
      textStyle="body.02"
      mb="space.04"
      pl="space.05"
      css={{ listStyleType: 'disc' }}
      lineHeight="1.6"
    >
      {children}
    </styled.ul>
  );
}

function Ol({ children }: MarkdownComponentsProps) {
  return (
    <styled.ol
      textStyle="body.02"
      mb="space.04"
      pl="space.05"
      css={{ listStyleType: 'decimal' }}
      lineHeight="1.6"
    >
      {children}
    </styled.ol>
  );
}

function Li({ children }: MarkdownComponentsProps) {
  return (
    <styled.li mb="space.02" ml="space.02">
      {children}
    </styled.li>
  );
}

function Blockquote({ children }: MarkdownComponentsProps) {
  return (
    <styled.blockquote
      borderLeft="4px solid"
      borderColor="ink.border-default"
      pl="space.04"
      ml="space.00"
      my="space.04"
      fontStyle="italic"
      color="ink.text-subdued"
    >
      {children}
    </styled.blockquote>
  );
}

function Code({ children }: MarkdownComponentsProps) {
  return (
    <styled.code
      bg="ink.background-secondary"
      px="space.01"
      py="2px"
      borderRadius="xs"
      fontFamily="monospace"
      fontSize="0.9em"
      color="ink.text-primary"
    >
      {children}
    </styled.code>
  );
}

function Pre({ children }: MarkdownComponentsProps) {
  return (
    <styled.pre
      bg="ink.background-secondary"
      p="space.04"
      borderRadius="sm"
      overflowX="auto"
      mb="space.04"
      fontFamily="monospace"
      fontSize="0.9em"
    >
      {children}
    </styled.pre>
  );
}

function Hr() {
  return (
    <styled.hr
      borderBottom="default"
      borderColor="ink.border-default"
      my="space.05"
      borderTop="none"
    />
  );
}

function Table({ children }: MarkdownComponentsProps) {
  return (
    <styled.table width="100%" mb="space.04" borderCollapse="collapse">
      {children}
    </styled.table>
  );
}

function Thead({ children }: MarkdownComponentsProps) {
  return (
    <styled.thead borderBottom="2px solid" borderColor="ink.border-default">
      {children}
    </styled.thead>
  );
}

function Tbody({ children }: MarkdownComponentsProps) {
  return <styled.tbody>{children}</styled.tbody>;
}

function Tr({ children }: MarkdownComponentsProps) {
  return (
    <styled.tr borderBottom="1px solid" borderColor="ink.border-default">
      {children}
    </styled.tr>
  );
}

function Th({ children }: MarkdownComponentsProps) {
  return (
    <styled.th
      textStyle="label.03"
      fontWeight="semibold"
      p="space.03"
      textAlign="left"
      color="ink.text-subdued"
    >
      {children}
    </styled.th>
  );
}

function Td({ children }: MarkdownComponentsProps) {
  return (
    <styled.td textStyle="body.02" p="space.03">
      {children}
    </styled.td>
  );
}

interface AnchorProps extends MarkdownComponentsProps {
  href?: string;
}

function A({ children, href }: AnchorProps) {
  // Robust host check for 'leather.io' rather than substring match
  let isLeatherLink = false;
  let normalizedHref = href;
  if (href) {
    // Use the URL constructor for absolute URLs. For relative URLs, fallback to default behavior.
    const url = href.startsWith('http://') || href.startsWith('https://') ? new URL(href) : null;
    // Check if the host is 'leather.io' or a valid subdomain (e.g. www.leather.io)
    if (url && (url.hostname === 'leather.io' || url.hostname.endsWith('.leather.io'))) {
      isLeatherLink = true;
      normalizedHref = url.pathname + url.search + url.hash;
    }
  }

  return (
    <Link
      href={normalizedHref || '#'}
      target={isLeatherLink ? '_self' : '_blank'}
      style={{ fontSize: 'inherit', display: 'inline' }}
    >
      {children}
    </Link>
  );
}

function Strong({ children }: MarkdownComponentsProps) {
  return <styled.strong fontWeight="semibold">{children}</styled.strong>;
}

function Em({ children }: MarkdownComponentsProps) {
  return <styled.em fontStyle="italic">{children}</styled.em>;
}

function Del({ children }: MarkdownComponentsProps) {
  return <styled.del textDecoration="line-through">{children}</styled.del>;
}

interface VideoProps {
  src?: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  return null;
}

function Video({ src, poster, controls = true, autoPlay, loop, muted, width, height }: VideoProps) {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(src || '');

  if (youtubeEmbedUrl) {
    return (
      <styled.div my="space.04" position="relative" width="75%" borderRadius="sm" overflow="hidden">
        <styled.div position="relative" pb="56.25%" height="0">
          <styled.iframe
            src={youtubeEmbedUrl}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            position="absolute"
            top="0"
            left="0"
            width="100%"
            referrerPolicy="strict-origin-when-cross-origin"
            height="100%"
            border="none"
          />
        </styled.div>
      </styled.div>
    );
  }

  return (
    <styled.video
      src={src}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      width={width || '100%'}
      height={height || 'auto'}
      borderRadius="sm"
      mb="space.04"
      maxWidth="100%"
    />
  );
}

export const markdownComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  blockquote: Blockquote,
  code: Code,
  pre: Pre,
  hr: Hr,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  a: A,
  strong: Strong,
  em: Em,
  del: Del,
  video: Video,
};
