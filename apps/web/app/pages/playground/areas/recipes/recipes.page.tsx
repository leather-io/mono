import { useSearchParams } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  DeviceFrame,
  type FrameSizeId,
  frameLayout,
  frameSizeIds,
  themeIds,
} from '../../shared/exploration/frame';
import type { RecipeMeta } from '../../shared/recipes/recipe-meta';
import { type RecipeId, recipeDemos, recipeIds } from './recipe-demos';

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.find(item => item === value) ?? fallback;
}

interface RecipeFrameProps {
  recipe: RecipeId;
  frame: FrameSizeId;
  theme: 'light' | 'dark';
}

function RecipeFrame({ recipe, frame, theme }: RecipeFrameProps) {
  const { label, Demo, meta } = recipeDemos[recipe];
  return (
    <Stack gap="space.02" data-recipe={recipe}>
      <styled.span textStyle="caption.01" color="ink.text-secondary">
        {label}
      </styled.span>
      <DeviceFrame frame={frame} theme={theme} variant="recipes" screen={recipe}>
        <Demo frame={frameLayout(frame)} />
      </DeviceFrame>
      {meta ? <RecipeMetaNotes meta={meta} /> : null}
    </Stack>
  );
}

function RecipeMetaNotes({ meta }: { meta: RecipeMeta }) {
  return (
    <Stack gap="space.02" maxWidth="390px" textStyle="caption.01" color="ink.text-secondary">
      <styled.span>Mirrors {meta.mirrors}</styled.span>
      <styled.ul listStyleType="disc" pl="space.04">
        {meta.useWhen.map(line => (
          <li key={line}>{line}</li>
        ))}
      </styled.ul>
      <styled.ul listStyleType="disc" pl="space.04">
        {meta.dontUseWhen.map(alt => (
          <li key={alt.situation}>
            Not for {alt.situation.charAt(0).toLowerCase() + alt.situation.slice(1)}: {alt.use}
          </li>
        ))}
      </styled.ul>
    </Stack>
  );
}

export function RecipesPage() {
  const [searchParams] = useSearchParams();
  const recipeParam = searchParams.get('recipe');
  const recipe = recipeIds.find(id => id === recipeParam);
  const theme = pick(searchParams.get('theme'), themeIds, 'light');
  const frame = pick(searchParams.get('frame'), frameSizeIds, 'popup');
  return (
    <Box minHeight="100vh" bg="ink.background-secondary" color="ink.text-primary">
      <Stack gap="space.05" px="space.07" py="space.06">
        <styled.h1 textStyle="label.01">Composition recipes</styled.h1>
        <Flex gap="space.05" flexWrap="wrap" alignItems="flex-start">
          {recipe ? (
            <RecipeFrame recipe={recipe} frame={frame} theme={theme} />
          ) : (
            recipeIds.map(id => <RecipeFrame key={id} recipe={id} frame={frame} theme={theme} />)
          )}
        </Flex>
      </Stack>
    </Box>
  );
}
