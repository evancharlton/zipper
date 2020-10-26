import v8 from 'v8';

import { table } from './logging';
import { EdgeMap, Graph } from './types';

export default (graph: Graph, sharedEdges: EdgeMap) => {
  const prunedGraph: Graph = v8.deserialize(v8.serialize(graph));
  Object.entries(sharedEdges).forEach(([edgeId, edge]) => {
    const { startVertexId, endVertexId } = edge;
    prunedGraph[startVertexId].neighbors.delete(endVertexId);
    prunedGraph[endVertexId].neighbors.delete(startVertexId);
  });

  Object.keys(prunedGraph)
    .filter((vertexId) => {
      const vertex = prunedGraph[vertexId];
      return vertex.neighbors.size === 0;
    })
    .forEach((vertexId) => {
      delete prunedGraph[vertexId];
    });

  table(prunedGraph);
  return prunedGraph;
};
