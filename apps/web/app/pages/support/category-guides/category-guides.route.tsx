import { MetaDescriptor, redirect } from 'react-router';

import { handleSupportFormAction } from '~/utils/support/support-form-action';

import { Route } from './+types/category-guides.route';

export function meta() {
  return [
    { title: 'Guides – Leather' },
    { name: 'description', content: 'Leather wallet user guides for every stage' },
  ] satisfies MetaDescriptor[];
}

export async function action({ request }: Route.ActionArgs) {
  return handleSupportFormAction(request);
}

export function loader({ params }: Route.LoaderArgs): Response {
  return redirect(`/posts/${params.slug}`);
}
