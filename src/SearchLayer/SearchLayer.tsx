import React from 'react';
import { useRecoilState } from 'recoil';
import SearchInput from './SearchInput';
import { nummerState } from '../state';
import './SearchLayer.css';

const SearchLayer = () => {
  const [nummerQuery, setNummerQuery] = useRecoilState(nummerState);

  return (
    <div className="search-area">
      <SearchInput
        placeholder="Postnummer"
        value={nummerQuery}
        onChange={setNummerQuery}
      />
    </div>
  );
};

export default SearchLayer;
