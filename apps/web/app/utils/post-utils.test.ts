import { describe, it, expect, vi } from 'vitest';
import { toCamelCase, getPostByKey } from './post-utils';

// Mock the content.posts
vi.mock('~/data/content', () => ({
  content: {
    posts: {
      // camelCase keys
      stackingAmount: { title: 'Stacking Amount', slug: 'stacking-amount' },
      historicalYield: { title: 'Historical Yield', slug: 'historical-yield' },
      
      // We want to test that we can get the same post via different methods
      // This simulates how posts might be accessed in the codebase
      'test-post': { title: 'Test Post', slug: 'test-post' },
      testPost: { title: 'Test Post', slug: 'test-post' },
    }
  }
}));

describe('post-utils', () => {
  describe('toCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('stacking-amount')).toBe('stackingAmount');
      expect(toCamelCase('historical-yield')).toBe('historicalYield');
      expect(toCamelCase('multiple-word-key-here')).toBe('multipleWordKeyHere');
    });
    
    it('should return the same string if already camelCase', () => {
      expect(toCamelCase('stackingAmount')).toBe('stackingAmount');
      expect(toCamelCase('historicalYield')).toBe('historicalYield');
    });
    
    it('should handle edge cases', () => {
      expect(toCamelCase('')).toBe('');
      expect(toCamelCase('single')).toBe('single');
      expect(toCamelCase('-starts-with-dash')).toBe('StartsWithDash');
      expect(toCamelCase('ends-with-dash-')).toBe('endsWithDash-');
    });
  });
  
  describe('getPostByKey', () => {
    it('should retrieve posts by camelCase key', () => {
      const post = getPostByKey('stackingAmount');
      expect(post).toBeDefined();
      expect(post?.title).toBe('Stacking Amount');
    });
    
    it('should retrieve posts by kebab-case key', () => {
      const post = getPostByKey('stacking-amount');
      expect(post).toBeDefined();
      expect(post?.title).toBe('Stacking Amount');
    });
    
    it('should retrieve the same post with either kebab-case or camelCase', () => {
      const post1 = getPostByKey('test-post');
      const post2 = getPostByKey('testPost');
      
      expect(post1).toBeDefined();
      expect(post2).toBeDefined();
      expect(post1).toEqual(post2);
    });
    
    it('should return undefined for non-existent posts', () => {
      const post = getPostByKey('non-existent-post');
      expect(post).toBeUndefined();
    });
  });
}); 