import { atom, selector } from 'recoil';
import { nummerPattern, nummerState } from './filter';

type XYCoordinate = [number, number];
type Polygon = XYCoordinate[];

type DataLookup = { [query: string]: Polygon[] };

const nummerFilter = (geo: any, query: string) => {
  const copy = {
    ...geo,
  };

  copy.features = geo.features.filter(({ properties: { postnummer } }: any) => {
    return postnummer.startsWith(query);
  });

  return copy;
};

const PLACEHOLDER_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [],
  pending: true,
};

export const payloadState = atom({
  key: 'data-payload',
  default: {} as DataLookup,
});

export const payloadLoaded = selector({
  key: 'data-payload-loaded',
  get: ({ get }) => {
    const payload = get(payloadState);
    return !!payload['xxxx'];
  },
});

export const geojsonState = atom({
  key: 'geojson',
  default: PLACEHOLDER_GEOJSON,
});

export const geojsonLookupState = atom({
  key: 'geojson-lookuo',
  default: PLACEHOLDER_GEOJSON,
});

export const geojsonLoaded = selector({
  key: 'geojson-loaded',
  get: ({ get }) => {
    const { pending } = get(geojsonState);
    return pending !== true;
  },
});

export const geojsonLookupLoaded = selector({
  key: 'geojson-lookup-loaded',
  get: ({ get }) => {
    const { pending } = get(geojsonLookupState);
    return pending !== true;
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
