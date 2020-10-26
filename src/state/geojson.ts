import { atom, selector } from 'recoil';
import { nummerPattern, nummerState } from './filter';

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
} as const;

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
    const nummerInput = get(nummerState);
    if (nummerInput.length === 4) {
      return get(geojsonState);
    }

    const pattern = get(nummerPattern);
    console.log(`TCL: pattern`, pattern);
    return nummerFilter(get(geojsonState), pattern);
  },
});
