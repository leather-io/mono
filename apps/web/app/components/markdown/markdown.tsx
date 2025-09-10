import ReactMarkdown from 'react-markdown';

import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '~/components/markdown/markdown-components';

export default function CustomMarkdown({ children }: { children: string | null | undefined }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={markdownComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
