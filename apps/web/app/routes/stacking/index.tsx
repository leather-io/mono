import { Stacking } from '~/pages/stacking/stacking';

export function loader() {
  return true;
}

// eslint-disable-next-line no-empty-pattern
export function meta({}) {
  return [
    { title: 'Leather Earn' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
  ];
}

export default function HomeRoute() {
  return <Stacking />;
}
