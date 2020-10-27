import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import mapboxgl, { LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { geoBounds, geojsonData, mapState } from '../state';
import { NORWAY } from '../constants';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZXZhbmNoYXJsdG9uIiwiYSI6ImNrZ205b2diejAyazQzNW9jajdud2J2NnMifQ.LwYUjS8uxTr2DxYoKoGykA';

const SOURCE_ID = 'geojson-id' as const;
const LAYER_ID = 'layer-id' as const;

const MapDisplay = () => {
  const geojson = useRecoilValue(geojsonData);
  const setMapLoaded = useSetRecoilState(mapState);
  const bounds = useRecoilValue(geoBounds);

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
            'line-width': 3,
            'line-opacity': 0.4,
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

  useEffect(() => {
    if (!map) {
      return;
    }

    if (bounds) {
      map.fitBounds(bounds as LngLatBoundsLike);
    }
  }, [map, bounds]);

  return <div ref={onSetDivRef} style={{ height: '100%' }}></div>;
};

export default MapDisplay;
