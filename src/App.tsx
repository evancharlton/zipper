import React, { useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { mapState, payloadState } from './state';
import ForkMe from './ForkMe';
import LoadingLayer from './LoadingLayer';
import MapDisplay from './MapDisplay';
import SearchLayer from './SearchLayer';

import './App.css';

const App = () => {
  const setPayload = useSetRecoilState(payloadState);
  const map = useRecoilValue(mapState);

  useEffect(() => {
    if (!map) {
      return;
    }

    fetch(`${process.env.PUBLIC_URL}/clustered.json`)
      .then((resp) => resp.json())
      .then((json) => {
        console.log('Loaded json');
        return json;
      })
      .then((json) => setPayload(json))
      .then(() => console.log('Set json'));
  }, [map, setPayload]);

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
