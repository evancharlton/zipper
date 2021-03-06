import React from 'react';
import { useRecoilValue } from 'recoil';
import { mapState, payloadLoaded } from '../state';
import './LoadingLayer.css';

const LoadingLayer = () => {
  const mapLoaded = useRecoilValue(mapState);
  const dataLoaded = useRecoilValue(payloadLoaded);

  if (mapLoaded && dataLoaded) {
    return null;
  }

  return (
    <div className="loading-layer">
      <div className="lds-dual-ring" />
      {!mapLoaded && <h3>Loading map&hellip;</h3>}
      {!dataLoaded && <h3>Loading data&hellip;</h3>}
    </div>
  );
};

export default LoadingLayer;
