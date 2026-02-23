/**
 * Migration script: Legacy Help Center → New Help Center schema
 *
 * Reads legacy `legacyHelpCenterCategory` + `post` documents and creates
 * new `helpCenterCategory` + `helpCenterGuide` documents with deterministic IDs.
 *
 * Usage:
 *   1. Log in to Sanity CLI:  pnpm exec sanity login
 *   2. Get your token:        pnpm exec sanity debug --secrets 2>&1 | grep 'Auth token'
 *   3. Dry run (default):     SANITY_API_TOKEN=<token> npx tsx scripts/migrate-help-center.ts
 *   4. Execute for real:      SANITY_API_TOKEN=<token> npx tsx scripts/migrate-help-center.ts --execute
 *
 * Idempotent: uses createIfNotExists, safe to re-run.
 */
import { createClient } from '@sanity/client';

import { sanityDataset, sanityProjectId } from '../src/environment';

const EXECUTE = process.argv.includes('--execute');

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error(
    'Missing SANITY_API_TOKEN. Run:\n' +
      '  pnpm exec sanity login\n' +
      '  pnpm exec sanity debug --secrets 2>&1 | grep "Auth token"'
  );
  process.exit(1);
}

const client = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: '2025-09-04',
  token,
  useCdn: false,
});

interface LegacyCategory {
  _id: string;
  categoryName: string;
  slug: { current: string };
  icon: unknown;
  guides: LegacyPost[];
}

interface LegacyPost {
  _id: string;
  title: string;
  slug: { current: string };
  body: string | null;
  disclaimer: string | null;
  createdTime: string | null;
  publishedAt: string | null;
  relatedPosts: Array<{ _id: string }> | null;
}

function categoryId(legacyId: string) {
  return `helpCenterCategory-${legacyId}`;
}

function guideId(legacyPostId: string) {
  return `helpCenterGuide-${legacyPostId}`;
}

async function fetchLegacyData() {
  const result = await client.fetch<{ categories: LegacyCategory[] } | null>(`*[
    _type == "legacyHelpCenterPage"
  ][0]{
    categories[]->{
      _id,
      categoryName,
      slug,
      icon,
      guides[]->{
        _id,
        title,
        slug,
        body,
        disclaimer,
        createdTime,
        publishedAt,
        relatedPosts[]->{ _id }
      }
    }
  }`);

  if (!result?.categories) {
    throw new Error('No legacy help center data found');
  }

  return result.categories;
}

function buildMutations(categories: LegacyCategory[]) {
  const categoryDocs: Array<Record<string, unknown>> = [];
  const guideDocs: Array<Record<string, unknown>> = [];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];

    categoryDocs.push({
      _id: categoryId(cat._id),
      _type: 'helpCenterCategory',
      name: cat.categoryName,
      slug: cat.slug,
      icon: cat.icon,
      order: i,
    });

    for (const post of cat.guides ?? []) {
      const relatedGuides = (post.relatedPosts ?? []).map(rp => ({
        _type: 'reference',
        _ref: guideId(rp._id),
        _key: rp._id,
      }));

      guideDocs.push({
        _id: guideId(post._id),
        _type: 'helpCenterGuide',
        title: post.title,
        slug: post.slug,
        category: {
          _type: 'reference',
          _ref: categoryId(cat._id),
        },
        body: post.body,
        disclaimer: post.disclaimer,
        publishedAt: post.createdTime ?? post.publishedAt ?? new Date().toISOString(),
        ...(relatedGuides.length > 0 ? { relatedGuides } : {}),
      });
    }
  }

  return { categoryDocs, guideDocs };
}

async function run() {
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (writing to Sanity)' : 'DRY RUN (no writes)'}`);
  console.log(`Project: ${sanityProjectId}, Dataset: ${sanityDataset}\n`);

  console.log('Fetching legacy help center data...');
  const categories = await fetchLegacyData();

  const totalGuides = categories.reduce((sum, cat) => sum + (cat.guides?.length ?? 0), 0);
  console.log(`Found ${categories.length} categories with ${totalGuides} guides total.\n`);

  const { categoryDocs, guideDocs } = buildMutations(categories);

  console.log('Categories to create:');
  for (const doc of categoryDocs) {
    console.log(`  ${doc._id} → "${doc.name}" (order: ${doc.order})`);
  }

  console.log(`\nGuides to create: ${guideDocs.length}`);
  for (const doc of guideDocs) {
    const related = (doc.relatedGuides as Array<Record<string, string>> | undefined)?.length ?? 0;
    console.log(
      `  ${doc._id} → "${doc.title}" (category: ${(doc.category as Record<string, string>)._ref})${related > 0 ? ` [${related} related]` : ''}`
    );
  }

  if (!EXECUTE) {
    console.log('\nDry run complete. Pass --execute to write to Sanity.');
    return;
  }

  console.log('\nCreating documents...');
  const transaction = client.transaction();

  for (const doc of categoryDocs) {
    transaction.createIfNotExists(doc as Parameters<typeof transaction.createIfNotExists>[0]);
  }
  for (const doc of guideDocs) {
    transaction.createIfNotExists(doc as Parameters<typeof transaction.createIfNotExists>[0]);
  }

  const result = await transaction.commit();
  console.log(`Done. Transaction ID: ${result.transactionId}`);
  console.log(`Created ${categoryDocs.length} categories and ${guideDocs.length} guides.`);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
