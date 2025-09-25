import { codeInput } from '@sanity/code-input';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { markdownSchema } from 'sanity-plugin-markdown';
import { structureTool } from 'sanity/structure';

import { sanityDataset, sanityProjectId } from './src/environment';
import { schemaTypes } from './src/studio/schema-types';
import { structure } from './src/studio/structure/structure';

export default defineConfig({
  name: 'cms',
  title: 'Leather - CMS',

  projectId: sanityProjectId,
  dataset: sanityDataset,

  plugins: [markdownSchema(), codeInput(), structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
