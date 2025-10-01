import { MetaDescriptor } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { HelpCenter } from '~/pages/help-center/help-center';
import {
  frontSupportMessageSchema,
  postFrontAppSupportMessage,
} from '~/utils/support/front-app-integration';

import { LegacyHelpCenterPageQueryResult, legacyHelpCenterPageQuery } from '@leather.io/cms';

import { Route } from './+types/help-center.route';

export function meta() {
  return [
    { title: 'Guides – Leather' },
    { name: 'description', content: 'Leather wallet user guides for every stage' },
  ] satisfies MetaDescriptor[];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const payload = {
    name: form.getAll('name')[0],
    email: form.getAll('email')[0],
    subject: form.getAll('subject')[0],
    body: form.getAll('body')[0],
  };

  const parsedData = frontSupportMessageSchema.safeParse(payload);

  if (!parsedData.success) {
    // eslint-disable-next-line no-console
    console.error('Error submitting form:', parsedData.error);
    return;
  }

  const resp = await postFrontAppSupportMessage(parsedData.data).catch(error => {
    // fail silently
    // eslint-disable-next-line no-console
    console.error(error);
    return error;
  });

  return resp.status;
}

type LoaderResult = Promise<{
  categories: NonNullable<LegacyHelpCenterPageQueryResult>['categories'];
}>;
export async function loader(): LoaderResult {
  const categories = await cmsClient.fetch(legacyHelpCenterPageQuery);

  if (!categories) throw new Error('Categories not found', { cause: 404 });

  return { categories: categories.categories };
}

export default function GuidesRoute() {
  return <HelpCenter />;
}
