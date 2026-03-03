import { MetaDescriptor } from 'react-router';

import { SendManyPage } from './send-many.page';

export function meta() {
  return [{ title: 'Send Many – Leather' }] satisfies MetaDescriptor[];
}

export default function SendManyRoute() {
  return <SendManyPage />;
}
