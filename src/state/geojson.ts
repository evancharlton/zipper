import { atom, selector } from 'recoil';
import { nummerPattern } from './filter';

const nummerFilter = (geo: any, query: string) => {
  const copy = {
    ...geo,
  };

  copy.features = geo.features.filter(({ properties: { postnummer } }: any) => {
    return postnummer.startsWith(query);
  });

  return copy;
};

export const geojsonState = atom({
  key: 'geojson',
  default: {
    type: 'FeatureCollection' as const,
    features: [],
    pending: true,
  },
});

export const geojsonFiltered = selector({
  key: 'geojson-filtered',
  get: ({ get }) => {
    const state = get(geojsonState);

    const nummerQuery = get(nummerPattern);
    if (nummerQuery) {
      return nummerFilter(state, nummerQuery);
    }

    return state;
  },
});

export const geojsonLoaded = selector({
  key: 'geojson-loaded',
  get: ({ get }) => {
    const { pending } = get(geojsonState);
    return pending !== true;
  },
});
