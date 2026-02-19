interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface WebApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'WebApplication';
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
}

export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Leather',
  url: 'https://leather.io',
  logo: 'https://leather.io/images/leather-og.png',
  description:
    'Leather is a Bitcoin and Stacks wallet for managing your crypto assets, stacking STX, and interacting with decentralized applications.',
  sameAs: [
    'https://twitter.com/LeatherBTC',
    'https://github.com/leather-io',
    'https://discord.gg/leather',
  ],
};

export const webApplicationSchema: WebApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Leather Wallet',
  url: 'https://leather.io',
  description:
    'Bitcoin and Stacks wallet for stacking, portfolio management, and decentralized applications.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web, Chrome, Firefox, Brave, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  image?: string;
  description?: string;
}

export function createArticleSchema(options: {
  headline: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  description?: string;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.headline,
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    author: {
      '@type': 'Organization',
      name: 'Leather',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Leather',
      logo: {
        '@type': 'ImageObject',
        url: 'https://leather.io/images/leather-og.png',
      },
    },
    image: options.image,
    description: options.description,
  };
}
