import { LngLatBoundsLike } from 'mapbox-gl';
import { atom, selector } from 'recoil';
import { NORWAY } from '../constants';
import { nummerPattern, nummerState } from './filter';

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

type nn = [[number, number], [number, number]];

const BOUNDS: nn = [
  [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER] as [number, number],
  [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER] as [number, number],
];

const cap = (
  [[westA, southA], [eastA, northA]]: nn,
  [[westB, southB], [eastB, northB]]: nn
): LngLatBoundsLike => {
  return [
    [Math.max(westA, westB), Math.max(southA, southB)],
    [Math.min(eastA, eastB), Math.min(northA, northB)],
  ];
};

export const geoBounds = selector<LngLatBoundsLike | null>({
  key: 'geo-bounds',
  get: ({ get }) => {
    const query = get(nummerState);
    if (!query) {
      return NORWAY;
    }
    const results: Polygon[] = get(geoResults);
    if (results.length === 0) {
      return null;
    }

    // @ts-ignore
    const boundingBox: LngLatBoundsLike = results.reduce((acc, polygon) => {
      const polygonBounds: nn = polygon.reduce(
        ([[west, south], [east, north]], xy) => {
          const [x, y] = xy as [number, number];
          return [
            [Math.max(west, x), Math.max(south, y)],
            [Math.min(east, x), Math.min(north, y)],
          ];
        },
        BOUNDS
      );
      // @ts-ignore
      return cap(acc, polygonBounds);
    }, BOUNDS as nn);

    return boundingBox;
  },
});
