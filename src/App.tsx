import React, { useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { geojsonState, mapState } from './state';
import ForkMe from './ForkMe';
import LoadingLayer from './LoadingLayer';
import MapDisplay from './MapDisplay';
import SearchLayer from './SearchLayer';

import './App.css';

const App = () => {
  const setGeojson = useSetRecoilState(geojsonState);
  const map = useRecoilValue(mapState);

  useEffect(() => {
    if (!map) {
      return;
    }

    fetch(`${process.env.PUBLIC_URL}/data/xxxx.json`)
      .then((resp) => resp.json())
      .then((json) => setGeojson(json));
  }, [map, setGeojson]);

  return (
    <>
      <MapDisplay />
      <SearchLayer />
      <LoadingLayer />
      <ForkMe />
    </>
  );
};

export default App;
