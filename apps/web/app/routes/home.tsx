import { Welcome } from '../welcome/welcome';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather' }, { name: 'description', content: 'Bitcoin for the rest of us' }];
}

export default function Home() {
  return <Welcome />;
}
