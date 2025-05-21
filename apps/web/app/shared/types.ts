import { ReactElement } from 'react';

/**
 * Type definitions for HTML element tags
 */
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type TextTag = 'p' | 'span' | 'div';
export type LabelTag = 'label' | 'span';
export type TextElementTag = HeadingTag | TextTag | LabelTag;

/**
 * Validation helper for checking if a string is a valid text element tag
 */
export function isValidTextElementTag(tag: string): tag is TextElementTag {
  const validTags = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'div',
    'label'
  ];
  return validTags.includes(tag);
}

/**
 * React Element Type Guidelines
 * 
 * Use ReactNode for:
 * - Component children
 * - Content that might include strings, numbers, or elements
 * - Any prop that accepts mixed content types
 */

/**
 * Use ReactElement for:
 * - When you need specifically a rendered React element
 * - Icon collections
 * - Element registries
 */

/**
 * Type definition for icon maps
 */
export type IconMapType = Record<string, ReactElement>; 