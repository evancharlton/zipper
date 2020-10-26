import { table } from './logging';
import { EdgeMap } from './types';

export default (edges: EdgeMap) => {
  const sharedEdges: EdgeMap = {};
  Object.entries(edges).forEach(([edgeId, edge]) => {
    if (edge.polygonIds.size > 1) {
      sharedEdges[edgeId] = edge;
    }
  });

  table(sharedEdges);

  return sharedEdges;
};
