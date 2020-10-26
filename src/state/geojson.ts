import { atom, selector } from 'recoil';
import { nummerPattern } from './filter';

type XYCoordinate = [number, number];
type Polygon = XYCoordinate[];

type DataLookup = { [query: string]: Polygon[] } & { level?: number };

const PLACEHOLDER_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [],
};

export const payloadState = atom({
  key: 'data-payload',
  default: {} as DataLookup,
});

export const payloadLoaded = selector({
  key: 'data-payload-loaded',
  get: ({ get }) => {
    const payload = get(payloadState);
    return (payload.level ?? 0) > 2;
  },
});

export const geoResults = selector({
  key: 'geo-results',
  get: ({ get }) => {
    const payload = get(payloadState);
    const pattern = get(nummerPattern);

    return payload[pattern] ?? [];
  },
});

export const geojsonData = selector({
  key: 'geojson-filtered',
  get: ({ get }) => {
    const results = get(geoResults);
    if (results.length === 0) {
      return PLACEHOLDER_GEOJSON;
    }

    return {
      type: 'FeatureCollection' as const,
      name: 'Zipper' as const,
      features: results.map((polygon) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'Polygon' as const,
          coordinates: [polygon],
        },
      })),
    };
  },
});
