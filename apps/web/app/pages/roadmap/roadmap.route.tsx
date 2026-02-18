import { MetaDescriptor } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { RoadmapPage } from '~/pages/roadmap/roadmap.page';

import { roadmapYearsQuery } from '@leather.io/cms';

import type { Route } from './+types/roadmap.route';

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

export async function loader() {
  return await cmsClient.fetch(roadmapYearsQuery);
}

export default function RoadmapRoute({ loaderData }: Route.ComponentProps) {
  return <RoadmapPage years={loaderData} />;
}
