import { defineCliConfig } from 'sanity/cli';

import { sanityDataset, sanityProjectId } from './src/environment';

export default defineCliConfig({
  api: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
});
