import { MetaDescriptor } from 'react-router';

export const defaultMetaTags = [
  {
    charSet: 'utf-8',
  },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1',
  },
  {
    name: 'twitter:creator',
    content: '@leatherBTC',
  },
  {
    name: 'twitter:site',
    content: '@leatherBTC',
  },
  {
    name: 'author',
    content: 'Leather',
  },
  {
    name: 'application-name',
    content: 'Leather',
  },
  {
    property: 'og:type',
    content: 'website',
  },
  {
    name: 'robots',
    content: 'index, follow',
  },
] satisfies MetaDescriptor[];
