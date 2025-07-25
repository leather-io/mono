import { z } from 'zod';

// Changelog entry metadata schema
export const ChangelogEntrySchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  slug: z.string(),
  tags: z.array(z.string()).default([]),
});

export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema> & {
  content: string;
  fileName: string;
};

// Import all markdown files as raw text using Vite's import.meta.glob
const markdownFiles = import.meta.glob('../changelogs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

// Parse frontmatter from markdown content
export function parseFrontmatter(content: string): { metadata: any; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    // No frontmatter found, return empty metadata and full content as body
    return { metadata: {}, body: content };
  }

  const [, frontmatterText, body] = match;

  // Simple YAML parser for basic key-value pairs
  const metadata: any = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Handle arrays (basic support for tags)
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      metadata[key] = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
    } else {
      metadata[key] = value;
    }
  }

  return { metadata, body };
}

// Get all changelog entries using Vite imported markdown files
export function getChangelogEntries(): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];

  for (const [filePath, content] of Object.entries(markdownFiles)) {
    const fileName = filePath.split('/').pop() || filePath;

    try {
      // Parse the markdown content (should be raw string now)
      const { metadata, body } = parseFrontmatter(content as string);

      // Validate metadata with Zod schema
      const validatedMetadata = ChangelogEntrySchema.parse(metadata);

      entries.push({
        ...validatedMetadata,
        content: markdownToHtml(body),
        fileName,
      });
    } catch {
      // Skip invalid changelog files
      continue;
    }
  }

  // Sort by date (newest first)
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Convert markdown to HTML (basic implementation)
export function markdownToHtml(markdown: string): string {
  // Split into lines and process
  const lines = markdown.trim().split('\n');
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    // Handle headers
    if (line.startsWith('# ')) {
      result.push(`<h1>${line.slice(2)}</h1>`);
    } else if (line.startsWith('## ')) {
      result.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      result.push(`<h3>${line.slice(4)}</h3>`);
    }
    // Handle list items
    else if (line.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${line.slice(2)}</li>`);

      // Check if next line ends the list
      if (!nextLine || !nextLine.startsWith('- ')) {
        result.push('</ul>');
        inList = false;
      }
    }
    // Handle empty lines
    else if (line.trim() === '') {
      // Skip empty lines in lists
      if (!inList) {
        // Add a line break between paragraphs
      }
    }
    // Handle regular paragraphs
    else if (line.trim()) {
      result.push(`<p>${line}</p>`);
    }
  }

  // Close any open lists
  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
}
