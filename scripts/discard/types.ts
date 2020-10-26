export type XYCoordinate = [number, number];

export type CoordinateList = XYCoordinate[];

export type Feature = {
  type: 'Feature';
  properties: {
    postnummer: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: [CoordinateList];
  };
};

export type Vertex = {
  x: number;
  y: number;
  neighbors: Set<string>; // xy
  polygonIds: Set<number>; // polygons which own this
};

export const isVertex = (item: unknown): item is Vertex => {
  return !!(item as Vertex).neighbors;
};

export type Edge = {
  startVertexId: string;
  endVertexId: string;
  polygonIds: Set<number>;
};

export type EdgeMap = { [xyxy: string]: Edge };

export const isEdge = (item: unknown): item is Edge => {
  return !!(item as Edge).polygonIds;
};

export type Polygon = {
  postnummer: string;
  index: number;
};

export const isPolygon = (item: unknown): item is Polygon => {
  return !!(item as Polygon).postnummer;
};

export type Graph = { [xy: string]: Vertex };
