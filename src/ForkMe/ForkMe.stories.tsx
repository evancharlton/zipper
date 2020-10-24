import React from 'react';
import ForkMe from './ForkMe';

export default {
  title: 'ForkMe',
  decorators: [
    (story: () => React.ReactNode) => (
      <div style={{ width: '100%', height: 500, backgroundColor: 'black' }}>
        {story()}
      </div>
    ),
  ],
};

export const Base = () => <ForkMe />;
