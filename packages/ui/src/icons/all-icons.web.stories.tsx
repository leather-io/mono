import React from 'react';

import { Meta } from '@storybook/react';

import * as Icons from './index.web';

const meta: Meta = {
  title: 'Icons/All Icons',
  component: () => <div />,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export default meta;

export function AllIcons() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '20px',
        justifyItems: 'center',
        padding: '20px',
      }}
    >
      {Object.entries(Icons).map(([name, IconComponent], index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconComponent width="24px" height="24px" />
          <div
            style={{
              marginTop: '8px',
              fontSize: '10px',
              maxWidth: '100px',
              wordWrap: 'break-word',
            }}
          >
            {name}
          </div>
        </div>
      ))}
    </div>
  );
}
