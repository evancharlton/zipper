import React from 'react';
import { useRecoilState } from 'recoil';
import SearchInput from './SearchInput';
import { nummerState } from '../state';

const SearchLayer = () => {
  const [nummerQuery, setNummerQuery] = useRecoilState(nummerState);

  return (
    <>
      <SearchInput
        placeholder="Postnummer"
        value={nummerQuery}
        onChange={setNummerQuery}
      />
    </>
  );
};

export default SearchLayer;
