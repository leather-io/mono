import { useFormContext } from 'react-hook-form';

import { Stack, styled } from 'leather-styles/jsx';
import { ExternalLink } from '~/components/external-link';
import { PoolName } from '~/features/stacking/utils/types-preset-pools';

import { PoolSelectItem } from './pool-select-item';
import { pools } from './preset-pools';
import { Description, Step } from './stacking-form-step';

interface ChoosePoolingPoolProps {
  onPoolChange: (val: PoolName) => void;
}
export function ChoosePoolingPool({ onPoolChange }: ChoosePoolingPoolProps) {
  const { getValues } = useFormContext();
  const fieldPoolName = getValues('poolName');
  function onChange(poolName: PoolName) {
    onPoolChange(poolName);
  }
  return (
    <Step title="Pool">
      <Description>
        <styled.p>
          Select a pool to start stacking or{' '}
          <ExternalLink href="https://www.stacks.co/learn/stacking">
            discover others on stacks.co.
          </ExternalLink>
        </styled.p>
      </Description>

      <Stack gap="space.02" mt="space.05">
        {(Object.keys(pools) as PoolName[]).map((poolName, index) => {
          const p = pools[poolName];
          if (p.disabled) return null;
          return (
            <PoolSelectItem
              name={p.name}
              icon={p.icon}
              description={p.description}
              url={p.website}
              key={index}
              activePoolName={fieldPoolName}
              onChange={onChange}
            />
          );
        })}
      </Stack>
    </Step>
  );
}
