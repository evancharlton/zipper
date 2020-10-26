import { CoordinateList, Feature } from './types';

export const createFeature = (
  name: string,
  coordinateList: CoordinateList
): Feature => ({
  type: 'Feature',
  properties: {
    postnummer: name,
  },
  geometry: {
    type: 'Polygon',
    coordinates: [coordinateList],
  },
});
