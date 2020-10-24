import React, { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { geojsonFeatures, kommuneState } from '../state';
import { SimpleFeature } from '../state/geojson';
import './KommuneList.css';

const KommuneList = () => {
  const features = useRecoilValue(geojsonFeatures);
  const setKommuneQuery = useSetRecoilState(kommuneState);

  const onClick = useCallback(
    (name: string) => () => {
      setKommuneQuery(name);
    },
    [setKommuneQuery]
  );

  return (
    <div className="kommunes">
      <ul className="kommune-list">
        {features.map(({ name, id }: SimpleFeature) => {
          return (
            <li key={id} className="kommune-name">
              <button onClick={onClick(name)}>{name}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default KommuneList;
