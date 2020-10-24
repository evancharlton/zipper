import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import mapboxgl, { LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { geojsonFiltered, mapState } from '../state';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZXZhbmNoYXJsdG9uIiwiYSI6ImNrZ205b2diejAyazQzNW9jajdud2J2NnMifQ.LwYUjS8uxTr2DxYoKoGykA';

const NORWAY: LngLatBoundsLike = [
  [4, 57],
  [33, 72],
];

const SOURCE_ID = 'geojson-id' as const;
const LAYER_ID = 'layer-id' as const;

const MapDisplay = () => {
  const geojson = useRecoilValue(geojsonFiltered);
  const setMapLoaded = useSetRecoilState(mapState);

  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  const onSetDivRef = useCallback(
    (ref) => {
      mapDivRef.current = ref;

      const createdMap = new mapboxgl.Map({
        container: ref,
        style: 'mapbox://styles/mapbox/dark-v10',
        bounds: NORWAY,
      });

      const onMapLoaded = () => {
        createdMap.addSource(SOURCE_ID, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection' as const,
            features: [],
          },
        });

        createdMap.addLayer({
          id: LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#fff',
            'line-width': 2,
            'line-opacity': 0.25,
          },
        });
        setMap(createdMap);
        setMapLoaded(true);
      };

      createdMap.on('load', onMapLoaded);
    },
    [mapDivRef, setMapLoaded]
  );

  // When the geojson data changes, update the map.
  useEffect(() => {
    if (!geojson || !map) {
      return;
    }

    (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(geojson);
  }, [geojson, map]);

  return (
    <div
      ref={onSetDivRef}
      style={{
        height: '100%',
      }}
    ></div>
  );
};

export default MapDisplay;
