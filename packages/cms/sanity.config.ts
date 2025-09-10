import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { sanityDataset, sanityProjectId } from './src/environment';
import { schemaTypes } from './src/studio/schema-types';
import { structure } from './src/studio/structure/structure';

export default defineConfig({
  name: 'cms',
  title: 'Leather - CMS',

  projectId: sanityProjectId,
  dataset: sanityDataset,

  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
