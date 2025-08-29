import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { sanityDataset, sanityProjectId } from './src/environment';
import { schemaTypes } from './src/studio/schema-types';

export default defineConfig({
  name: 'cms',
  title: 'Leather - CMS',

  projectId: sanityProjectId,
  dataset: sanityDataset,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
