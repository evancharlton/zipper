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

export const geojsonFiltered = selector({
  key: 'geojson-filtered',
  get: ({ get }) => {
    const payload = get(payloadState);
    const pattern = get(nummerPattern);

    const polygons = payload[pattern];
    if (!polygons) {
      return PLACEHOLDER_GEOJSON;
    }

    return {
      type: 'FeatureCollection' as const,
      name: 'Zipper' as const,
      features: polygons.map((polygon) => ({
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
