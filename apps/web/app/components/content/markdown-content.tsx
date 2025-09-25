import ReactMarkdown from 'react-markdown';

import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { contentComponents } from '~/components/content/content-components';

export default function CustomMarkdown({ children }: { children: string | null | undefined }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={contentComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
