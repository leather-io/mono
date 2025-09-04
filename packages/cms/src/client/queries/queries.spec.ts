import {
  allBasicConceptsQuery,
  allPostsQuery,
  sbtcConceptsQuery,
  sbtcFaqQuery,
  sbtcPoolsQuery,
} from '.';
import { createCmsClient } from '../client';
import {
  allBasicConceptsSchema,
  allPostsSchema,
  faqSchema,
  faqSectionSchema,
  postSchema,
  sbtcConceptsSchema,
  sbtcPoolsSchema,
} from './schemas';

const client = createCmsClient({
  projectId: '70cnou7r',
  dataset: 'production',
  apiVersion: '2025-09-04',
  token: process.env.SANITY_API_TOKEN,
  useCdn: true,
});

describe('CMS Client Query Validation', () => {
  describe('allPostsQuery', () => {
    it('should return valid post structure', async () => {
      const posts = await client.fetch(allPostsQuery);

      expect(() => allPostsSchema.parse(posts)).not.toThrow();

      expect(Array.isArray(posts)).toBe(true);

      if (posts && posts.length > 0) {
        const post = posts[0];

        expect(() => postSchema.parse(post)).not.toThrow();
      }
    });
  });

  describe('sbtcPoolsQuery', () => {
    it('should return valid SBTC pool structure', async () => {
      const pools = await client.fetch(sbtcPoolsQuery);

      expect(() => sbtcPoolsSchema.parse(pools)).not.toThrow();

      expect(Array.isArray(pools)).toBe(true);
    });
  });

  describe('sbtcConceptsQuery', () => {
    it('should return valid sbtc basic concepts', async () => {
      const concepts = await client.fetch(sbtcConceptsQuery);

      expect(() => sbtcConceptsSchema.parse(concepts)).not.toThrow();

      expect(Object.keys(concepts)).toHaveLength(4);
    });
  });

  describe('sbtcFaqQuery', () => {
    it('should return valid FAQ section structure', async () => {
      const faqSection = await client.fetch(sbtcFaqQuery);

      expect(faqSection).toBeDefined();

      expect(() => faqSectionSchema.parse(faqSection)).not.toThrow();
    });

    it('should validate all FAQs against schema', async () => {
      const faqSection = await client.fetch(sbtcFaqQuery);

      if (faqSection?.faqBuilder && faqSection.faqBuilder.length > 0) {
        faqSection.faqBuilder.forEach((faq: any, index: number) => {
          expect(() => faqSchema.parse(faq)).not.toThrow(
            `FAQ at index ${index} failed schema validation`
          );
        });
      }
    });
  });

  describe('allBasicConceptsQuery', () => {
    it('should return valid basic concept structure', async () => {
      const concepts = await client.fetch(allBasicConceptsQuery);

      expect(() => allBasicConceptsSchema.parse(concepts)).not.toThrow();

      expect(Array.isArray(concepts)).toBe(true);
    });
  });

  describe('sbtcPoolsQuery', () => {
    it('should return valid SBTC pool structure', async () => {
      const pools = await client.fetch(sbtcPoolsQuery);
      expect(() => sbtcPoolsSchema.parse(pools)).not.toThrow();
    });
  });
});
