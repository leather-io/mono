import { WhenClient } from '~/components/when-client';

import { RecipesPage } from './recipes.page';

export default function RecipesRoute() {
  return (
    <WhenClient>
      <RecipesPage />
    </WhenClient>
  );
}
