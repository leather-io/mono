import { MetaDescriptor } from 'react-router';

import { RoadmapPage } from '~/pages/roadmap/roadmap.page';

export function meta() {
  return [
    { title: 'Product Roadmap – Leather' },
    {
      name: 'description',
      content:
        "Explore Leather's product roadmap. View our goals, current projects, and completed milestones with full transparency.",
    },
    { property: 'og:title', content: 'Product Roadmap – Leather' },
    {
      property: 'og:description',
      content:
        "Explore Leather's product roadmap. View our goals, current projects, and completed milestones with full transparency.",
    },
    { property: 'og:type', content: 'website' },
  ] satisfies MetaDescriptor[];
}

export default function RoadmapRoute() {
  return <RoadmapPage />;
}
