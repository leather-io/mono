import { MetaDescriptor } from 'react-router';

export const defaultMetaTags = [
  {
    charSet: 'utf-8',
  },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1',
  },
  // Prevents iOS from automatically changing DOM
  {
    name: 'format-detection',
    content: 'telephone=no, date=no, email=no, address=no',
  },
  {
    name: 'twitter:creator',
    content: '@LeatherBTC',
  },
  {
    name: 'twitter:site',
    content: '@LeatherBTC',
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
    property: 'og:image',
    content: '/images/leather-og.png',
  },
  {
    name: 'robots',
    content: 'index, follow',
  },
] satisfies MetaDescriptor[];
