import { atom, selector } from 'recoil';
import { kommuneState, nummerState } from './filter';

export const geojsonState = atom({
  key: 'geojson',
  default: {
    type: 'FeatureCollection' as const,
    features: [],
    pending: true,
  },
});

const kommuneFilter = (geo: any, query: string) => {
  const copy = {
    ...geo,
  };

  copy.features = geo.features.filter((feature: any) => {
    const {
      properties: { navn: names },
    } = feature;
    // navn is an array because there can be multiple names
    return (names as any[]).find(({ navn, sprak }: any) => {
      return (
        sprak === 'nor' && navn.toLowerCase().startsWith(query.toLowerCase())
      );
    });
  });

  return copy;
};

const nummerFilter = (geo: any, query: string) => {
  const copy = {
    ...geo,
  };

  copy.features = geo.features.filter((feature: any) => {
    return feature.properties.postnummer.startsWith(query);
  });

  return copy;
};

export const geojsonFiltered = selector({
  key: 'geojson-filtered',
  get: ({ get }) => {
    const state = get(geojsonState);
    const kommuneQuery = get(kommuneState);
    if (kommuneQuery) {
      return kommuneFilter(state, kommuneQuery);
    }

    const nummerQuery = get(nummerState);
    if (nummerQuery) {
      return nummerFilter(state, nummerQuery);
    }

    return state;
  },
});

export type SimpleFeature = {
  name: string;
  id: number;
};

export const geojsonFeatures = selector({
  key: 'geojson-features',
  get: ({ get }) => {
    const filtered = get(geojsonFiltered);
    const features: SimpleFeature[] = filtered.features.map((feature: any) => {
      const { lokalid = 0, navn: names = [] } = feature.properties;
      const result = names.find(({ sprak }: any) => sprak === 'nor') ??
        names[0] ?? { navn: '404' };
      return {
        name: result.navn,
        id: lokalid,
      };
    });
    return features
      .sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      .filter((value, index, arr) => {
        if (index === 0) {
          return true;
        }
        return value.name !== arr[index - 1].name;
      });
  },
});

export const geojsonLoaded = selector({
  key: 'geojson-loaded',
  get: ({ get }) => {
    const { pending } = get(geojsonState);
    return pending !== true;
  },
});
