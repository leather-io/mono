import { Page } from '@playwright/test';

// Mock CMS posts data
export const mockPostsData = {
  historicalYield: {
    id: 'mock-historical-yield',
    title: 'Historical Yield',
    slug: 'historical-yield',
    body: 'Mock body content for historical yield',
    date: '2023-01-01',
    status: 'published',
    category: 'stacking',
    subcategory: 'general',
    featured: true,
    hidden: false,
    question: 'What is historical yield?',
    prompt: 'Historical yield refers to the past performance of a stacking protocol.',
    images: [],
    sentence: 'Sentence for historical-yield',
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: 'Historical yield summary',
    website: '',
    disclaimer: '',
    order: 1,
    icon: [],
    dataPointValue: '5-8%',
    createdTime: '2023-01-01T00:00:00Z',
  },
  fastPool: {
    id: 'mock-fast-pool',
    title: 'Fast Pool',
    slug: 'fast-pool',
    body: 'Mock body content for Fast Pool',
    date: '2023-01-01',
    status: 'published',
    category: 'stacking',
    subcategory: 'providers',
    featured: true,
    hidden: false,
    question: 'What is Fast Pool?',
    prompt: 'Fast Pool is a stacking provider',
    images: [],
    sentence: 'Sentence for fast-pool',
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: 'Fast Pool summary',
    website: 'https://fastpool.org',
    disclaimer: '',
    order: 2,
    icon: [],
    dataPointValue: '',
    createdTime: '2023-01-01T00:00:00Z',
  },
  lisa: {
    id: 'mock-lisa',
    title: 'LISA',
    slug: 'lisa',
    body: 'Mock body content for LISA',
    date: '2023-01-01',
    status: 'published',
    category: 'stacking',
    subcategory: 'providers',
    featured: true,
    hidden: false,
    question: 'What is LISA?',
    prompt: 'LISA is a liquid stacking protocol',
    images: [],
    sentence: 'Sentence for lisa',
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: 'LISA summary',
    website: 'https://www.lisalab.io',
    disclaimer: '',
    order: 3,
    icon: [],
    dataPointValue: '',
    createdTime: '2023-01-01T00:00:00Z',
  },
  stackingDao: {
    id: 'mock-stacking-dao',
    title: 'Stacking DAO',
    slug: 'stacking-dao',
    body: 'Mock body content for Stacking DAO',
    date: '2023-01-01',
    status: 'published',
    category: 'stacking',
    subcategory: 'providers',
    featured: true,
    hidden: false,
    question: 'What is Stacking DAO?',
    prompt: 'Stacking DAO is a liquid stacking protocol',
    images: [],
    sentence: 'Sentence for stacking-dao',
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: 'Stacking DAO summary',
    website: 'https://www.stackingdao.com',
    disclaimer: '',
    order: 4,
    icon: [],
    dataPointValue: '',
    createdTime: '2023-01-01T00:00:00Z',
  },
  stackingRewardsTokens: {
    id: 'mock-stacking-rewards-tokens',
    title: 'Stacking Rewards Tokens',
    slug: 'stacking-rewards-tokens',
    body: 'Mock body content for Stacking Rewards Tokens',
    date: '2023-01-01',
    status: 'published',
    category: 'stacking',
    subcategory: 'general',
    featured: false,
    hidden: false,
    question: 'What are stacking rewards tokens?',
    prompt: 'Stacking rewards tokens are the tokens you receive as rewards for stacking.',
    images: [],
    sentence: 'Sentence for stacking-rewards-tokens',
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: 'Stacking rewards tokens summary',
    website: '',
    disclaimer: '',
    order: 5,
    icon: [],
    dataPointValue: '',
    createdTime: '2023-01-01T00:00:00Z',
  },
  testSlug: {
    id: 'mock-test-slug',
    title: 'Test Title',
    slug: 'test-slug',
    body: 'Test body content',
    date: '2023-01-01',
    status: 'published',
    category: 'test',
    subcategory: 'test',
    featured: false,
    hidden: false,
    question: 'Test question?',
    prompt: 'Test prompt text',
    images: [],
    sentence: 'Test subtitle',
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: 'Test summary',
    website: '',
    disclaimer: 'Test disclaimer',
    order: 6,
    icon: [],
    dataPointValue: '',
    createdTime: '2023-01-01T00:00:00Z',
  },
  sectionSlug: {
    id: 'mock-section-slug',
    title: 'Section Title',
    slug: 'section-slug',
    body: 'Section body content',
    date: '2023-01-01',
    status: 'published',
    category: 'test',
    subcategory: 'test',
    featured: false,
    hidden: false,
    question: 'Section question?',
    prompt: 'Step 1',
    images: [],
    sentence: 'This is a test sentence',
    views: [],
    earnProviders: [],
    dataPointInstructions: '',
    aliases: '',
    dataPointSource: '',
    summary: 'Section summary',
    website: '',
    disclaimer: 'Test disclaimer',
    order: 7,
    icon: [],
    dataPointValue: '',
    createdTime: '2023-01-01T00:00:00Z',
  }
};

// Convert mock data into the format expected by the application
export function generateMockPostsCollection() {
  const collection: Record<string, any> = {};
  
  Object.entries(mockPostsData).forEach(([key, post]) => {
    collection[key] = post;
  });
  
  return collection;
}

// Setup mock routes for protocol pages
export async function setupProtocolMocks(page: Page) {
  // Mock the CMS data fetch
  await page.route('https://leather-cms.s3.amazonaws.com/posts.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(generateMockPostsCollection()),
    });
  });
  
  // Setup protocol-specific mocks based on the URL pattern
  await page.route('**/api/protocols/**', async (route, request) => {
    const url = request.url();
    let protocolData;
    
    // Customize the mock data based on the protocol slug in the URL
    if (url.includes('stacking-dao')) {
      protocolData = {
        name: 'Stacking DAO',
        description: 'Stacking DAO is a liquid stacking protocol',
        icon: '<svg></svg>',
        apr: 0.08,
        tvl: 100000,
        tvlUsd: '$100,000',
        nextCycleDays: 14,
        nextCycleBlocks: 2016,
        nextCycleNumber: 54,
        payoutIcon: '<svg></svg>',
        payout: 'stSTX',
        minimumCommitment: 10000,
        minimumCommitmentUsd: '$1,000',
        contractAddress: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4',
        logo: '<svg></svg>',
      };
    } else if (url.includes('lisa')) {
      protocolData = {
        name: 'LISA',
        description: 'LISA is a liquid stacking protocol',
        icon: '<svg></svg>',
        apr: 0.07,
        tvl: 90000,
        tvlUsd: '$90,000',
        nextCycleDays: 14,
        nextCycleBlocks: 2016,
        nextCycleNumber: 54,
        payoutIcon: '<svg></svg>',
        payout: 'LiSTX',
        minimumCommitment: 5000,
        minimumCommitmentUsd: '$500',
        contractAddress: 'SM3KNVZS30WM7F89SXKVVFY4SN9RMPZZ9FX929N0V.lqstx-mint-endpoint-v2-01',
        logo: '<svg></svg>',
      };
    } else if (url.includes('fast-pool')) {
      protocolData = {
        name: 'Fast Pool',
        description: 'Fast Pool is a stacking provider',
        icon: '<svg></svg>',
        apr: 0.09,
        tvl: 120000,
        tvlUsd: '$120,000',
        nextCycleDays: 14,
        nextCycleBlocks: 2016,
        nextCycleNumber: 54,
        payoutIcon: '<svg></svg>',
        payout: 'BTC',
        minimumCommitment: 8000,
        minimumCommitmentUsd: '$800',
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        logo: '<svg></svg>',
      };
    } else {
      // Generic data for other protocols
      protocolData = {
        name: 'Test Protocol',
        description: 'Test protocol description',
        icon: '<svg></svg>',
        apr: 0.08,
        tvl: 100000,
        tvlUsd: '$100,000',
        nextCycleDays: 14,
        nextCycleBlocks: 2016,
        nextCycleNumber: 54,
        payoutIcon: '<svg></svg>',
        payout: 'BTC',
        minimumCommitment: 10000,
        minimumCommitmentUsd: '$1,000',
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        logo: '<svg></svg>',
      };
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(protocolData),
    });
  });
  
  // Setup pooled stacking HTML content mocks
  await page.route('**/stacking/pool/**', async (route, request) => {
    const url = request.url();
    // If this is an API request, don't fulfill it here
    if (url.includes('/api/')) {
      return route.continue();
    }
    
    // Extract the protocol slug from the URL
    const slug = url.split('/').pop() || 'unknown';
    
    // For 'unknown' protocol, let it go to 404
    if (slug === 'unknown') {
      return route.continue();
    }
    
    // Create mock HTML for pool stacking page
    const html = `
      <html>
        <head><title>${slug} Pooled Stacking</title></head>
        <body>
          <h1>${slug} Pooled Stacking</h1>
          <div>
            <p>Delegate STX to ${slug} pool to earn rewards</p>
            <div class="protocol-info">${slug} protocol information</div>
          </div>
        </body>
      </html>
    `;
    
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: html,
    });
  }, { times: 1 }); // Only intercept the first navigation, let subsequent requests through
  
  // Setup liquid stacking HTML content mocks
  await page.route('**/stacking/liquid/**', async (route, request) => {
    const url = request.url();
    // If this is an API request, don't fulfill it here
    if (url.includes('/api/')) {
      return route.continue();
    }
    
    // Extract the protocol slug from the URL
    const slug = url.split('/').pop() || 'unknown';
    
    // For 'unknown' protocol, let it go to 404
    if (slug === 'unknown') {
      return route.continue();
    }
    
    // Create mock HTML for liquid stacking page
    const html = `
      <html>
        <head><title>${slug} Liquid Stacking</title></head>
        <body>
          <h1>${slug} Liquid Stacking</h1>
          <div>
            <p>Convert STX to liquid staking tokens with ${slug}</p>
            <div class="protocol-info">${slug} protocol information</div>
          </div>
        </body>
      </html>
    `;
    
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: html,
    });
  }, { times: 1 }); // Only intercept the first navigation, let subsequent requests through
}

// Setup mock data for hover card tests
export async function setupHoverCardMocks(page: Page) {
  await page.addInitScript(() => {
    // Mock elements for hover card tests
    window.addEventListener('load', () => {
      const mockApp = document.createElement('div');
      mockApp.id = 'mock-app';
      document.body.appendChild(mockApp);
      
      // Value hover card
      if (window.location.pathname === '/hover-card-value') {
        const valueElement = document.createElement('div');
        valueElement.setAttribute('data-testid', 'hover-card-value');
        valueElement.textContent = '5–8%';
        valueElement.className = 'post-value-display';
        mockApp.appendChild(valueElement);
      }
      
      // Missing value hover card
      if (window.location.pathname === '/hover-card-value-missing') {
        const valueElement = document.createElement('div');
        valueElement.setAttribute('data-testid', 'hover-card-value-missing');
        valueElement.textContent = 'N/A';
        valueElement.className = 'post-value-display';
        mockApp.appendChild(valueElement);
      }
      
      // Label hover card
      if (window.location.pathname === '/hover-card-label') {
        const labelElement = document.createElement('div');
        labelElement.textContent = 'Historical yield';
        mockApp.appendChild(labelElement);
      }
      
      // Missing label hover card
      if (window.location.pathname === '/hover-card-label-missing') {
        const labelElement = document.createElement('div');
        labelElement.textContent = 'Unknown';
        mockApp.appendChild(labelElement);
      }
      
      // Add a mock radix popper content wrapper that shows on hover
      document.addEventListener('mouseover', (e) => {
        if (e.target instanceof HTMLElement) {
          if (e.target.textContent?.includes('Historical yield') || 
              e.target.hasAttribute('data-testid')) {
            const popperContent = document.createElement('div');
            popperContent.setAttribute('data-radix-popper-content-wrapper', '');
            popperContent.innerHTML = '<span>learn more</span>';
            document.body.appendChild(popperContent);
          }
        }
      });
    });
  });
}

// Setup mocks for XSS protection test
export async function setupXssMocks(page: Page) {
  await page.route('**/stacking/faq', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>FAQ Page</title></head>
          <body>
            <div id="content">
              <p>Safe text</p>
              <p>more text</p>
            </div>
          </body>
        </html>
      `,
    });
  });
}

// Setup mocks for post page heading tests
export async function setupPostPageHeadingMocks(page: Page) {
  // Mock the CMS data fetch first (shared with protocol mocks)
  await page.route('https://leather-cms.s3.amazonaws.com/posts.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(generateMockPostsCollection()),
    });
  });
  
  // Mock page content for test-slug
  await page.route('**/test-slug', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Test Page</title></head>
          <body>
            <h1>Test Title</h1>
            <p>Test subtitle <a href="/test-slug">Learn more</a></p>
            <p>Test disclaimer</p>
          </body>
        </html>
      `,
    });
  });
  
  // Mock page content for test-slug-missing-fields (empty page)
  await page.route('**/test-slug-missing-fields', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Empty Test Page</title></head>
          <body>
            <div>No content here</div>
          </body>
        </html>
      `,
    });
  });
}

// Setup mocks for post section heading tests
export async function setupPostSectionHeadingMocks(page: Page) {
  // Mock the CMS data fetch first (shared with protocol mocks)
  await page.route('https://leather-cms.s3.amazonaws.com/posts.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(generateMockPostsCollection()),
    });
  });
  
  // Mock page content for section-slug
  await page.route('**/section-slug', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Section Page</title></head>
          <body>
            <h2>Step 1: Section Title</h2>
            <p>This is a test sentence <a href="/section-slug">Learn more</a></p>
            <p>Test disclaimer</p>
          </body>
        </html>
      `,
    });
  });
  
  // Mock page content for section-slug-missing (empty page)
  await page.route('**/section-slug-missing', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Empty Section Page</title></head>
          <body>
            <div>No section content here</div>
          </body>
        </html>
      `,
    });
  });
} 