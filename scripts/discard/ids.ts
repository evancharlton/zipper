import { Edge, isEdge, isPolygon, isVertex, Polygon, Vertex } from './types';

export const makeEdgeId = (a: string, b: string): string => {
  return [a, b].sort().join(' -> ');
};

export const makeId = (item: Vertex | Polygon | Edge | number[]): string => {
  if (Array.isArray(item)) {
    return item.map(String).join(',');
  }

  if (isPolygon(item)) {
    return String(item.index);
  }

  if (isVertex(item)) {
    return `${item.x},${item.y}`;
  }

  if (isEdge(item)) {
    return makeEdgeId(item.endVertexId, item.startVertexId);
  }

  return '';
};
