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

    const get = (level: number) =>
      fetch(`${process.env.PUBLIC_URL}/clustered-${level}.json`)
        .then((resp) => resp.json())
        .then((json) =>
          setPayload((current) => ({ ...current, ...json, level }))
        );

    get(0)
      .then(() => get(1))
      .then(() => get(2))
      .then(() => get(3))
      .then(() => get(4));
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
