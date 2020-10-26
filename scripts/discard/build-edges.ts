import { makeEdgeId } from './ids';
import { intersection } from './intersection';
import { table } from './logging';
import { Edge, EdgeMap, Graph } from './types';

export default (graph: Graph) => {
  const edges: EdgeMap = {};
  Object.entries(graph).forEach(([vertexId, vertex]) => {
    // Each vertex has a few edges; let's build it.
    const { neighbors } = vertex;
    neighbors.forEach((neighborVertexId) => {
      const edgeId = makeEdgeId(vertexId, neighborVertexId);
      const edge: Edge = edges[edgeId] ?? {
        startVertexId: vertexId,
        endVertexId: neighborVertexId,
        polygonIds: new Set(vertex.polygonIds),
      };

      edge.polygonIds = intersection(edge.polygonIds, vertex.polygonIds);
      edges[edgeId] = edge;
    });
  });

  table(edges);

  return edges;
};
