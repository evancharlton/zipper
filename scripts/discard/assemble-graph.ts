import { createFeature } from './creators';
import { log, table } from './logging';
import { CoordinateList, Feature, Graph } from './types';

let globalFeatureCounter = 0;

export default (query: string, prefix: string, prunedGraph: Graph) => {
  const features: Feature[] = [];
  let coordinateList: CoordinateList = [];
  // Pick a starting point -- it doesn't matter which one.
  const startingKey = Object.keys(prunedGraph)[0];

  let currentKey = startingKey;
  while (Object.keys(prunedGraph).length > 0) {
    log(`Processing ${currentKey} ...`);

    const currentVertex = prunedGraph[currentKey];

    // We've pulled it out of the graph; prune the key
    delete prunedGraph[currentKey];

    coordinateList.push([currentVertex.x, currentVertex.y]);
    let nextVertexId: string | undefined = undefined;
    currentVertex.neighbors.forEach((vertexId) => {
      if (nextVertexId) {
        // We already chose one.
        return;
      }
      if (!prunedGraph[vertexId]) {
        // We've already processed this one.
        return;
      }
      nextVertexId = vertexId;
    });

    if (nextVertexId === undefined) {
      // Close out the feature.
      features.push(
        createFeature(
          `${query}-${prefix}-${globalFeatureCounter}`,
          coordinateList
        )
      );
      globalFeatureCounter += 1;
      // Clear the array
      coordinateList = [];

      // And then pick a new starting point -- we have a disconnected graph.
      nextVertexId = Object.keys(prunedGraph).filter(Boolean)[0];
      log('Disconnected graph; starting a new polygon');
    }

    currentKey = nextVertexId;
  }

  table(coordinateList);

  return features;
};
