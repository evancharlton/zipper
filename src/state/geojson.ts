import { atom, selector } from 'recoil';
import { kommuneState } from './kommune';

export const geojsonState = atom({
  key: 'geojson',
  default: {
    type: 'FeatureCollection' as const,
    features: [],
    pending: true,
  },
});

const filter = (geo: any, query: string) => {
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

export const geojsonFiltered = selector({
  key: 'geojson-filtered',
  get: ({ get }) => {
    const state = get(geojsonState);
    const query = get(kommuneState);
    if (query) {
      return filter(state, query);
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
      const { lokalid, navn: names } = feature.properties;
      const result =
        names.find(({ sprak }: any) => sprak === 'nor') ?? names[0];
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
