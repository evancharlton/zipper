import React, { useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import MapDisplay from './MapDisplay';
import './App.css';
import KommuneList from './KommuneList';
import SearchLayer from './SearchLayer';
import LoadingLayer from './LoadingLayer';
import Sidebar from './Sidebar';
import { geojsonState, mapState } from './state';

const App = () => {
  const setGeojson = useSetRecoilState(geojsonState);
  const map = useRecoilValue(mapState);

  useEffect(() => {
    if (!map) {
      return;
    }

    fetch(`${process.env.PUBLIC_URL}/kommune.json`)
      .then((resp) => resp.json())
      .then((json) => setGeojson(json));
  }, [map, setGeojson]);

  return (
    <>
      <MapDisplay />
      <Sidebar>
        <SearchLayer />
        <KommuneList />
      </Sidebar>
      <LoadingLayer />
    </>
  );
};

export default App;
