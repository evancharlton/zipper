import React from 'react';
import { useRecoilState } from 'recoil';
import SearchInput from './SearchInput';
import { kommuneState } from '../state';

const SearchLayer = () => {
  const [kommuneQuery, setKommuneQuery] = useRecoilState(kommuneState);

  return (
    <SearchInput
      placeholder="Kommune"
      value={kommuneQuery}
      onChange={setKommuneQuery}
    />
  );
};

export default SearchLayer;
