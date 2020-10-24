import React from 'react';
import { action } from '@storybook/addon-actions';
import SearchInput from './SearchInput';

export default {
  title: 'SearchInput',
  decorators: [
    (story: () => React.ReactNode) => (
      <div
        style={{
          width: '100%',
          height: 200,
          backgroundColor: 'black',
          padding: 20,
        }}
      >
        {story()}
      </div>
    ),
  ],
};

export const Base = () => (
  <SearchInput placeholder="Story" value="" onChange={action('onChange')} />
);

export const Value = () => (
  <SearchInput
    placeholder="Story"
    value="value"
    onChange={action('onChange')}
  />
);
