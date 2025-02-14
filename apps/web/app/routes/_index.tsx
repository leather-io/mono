import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [{ title: 'Leather' }, { name: 'description', content: 'Leather' }];
};

export default function Index() {
  return <div className="flex h-screen items-center justify-center">Hello</div>;
}
