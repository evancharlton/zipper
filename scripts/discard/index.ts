import assembleGraph from './assemble-graph';
import buildEdges from './build-edges';
import buildGraph from './build-graph';
import findSharedEdges from './find-shared-edges';
import pruneGraph from './prune-graph';
import { Feature } from './types';
import fs from 'fs';

const data = require(`${__dirname}/../public/postnummer.min.json`);

const discard = (query: string, prefix: string): Feature[] => {
  console.log(`Beginning ${query} / ${prefix} ...`);
  const { features } = getFilteredData(prefix);

  if (features.length === 0) {
    return [];
  }

  // Step 1: Build the graph
  const graph = buildGraph(features);

  // Step 2: Build the edges between all of the vertexes
  const edges = buildEdges(graph);

  // Step 3: Find the shared edges. If an edge is shared, then it can be removed
  // from the graph entirely.
  const sharedEdges = findSharedEdges(edges);

  // Step 4: Remove them from the graph
  const prunedGraph = pruneGraph(graph, sharedEdges);

  // Step 5: Reassemble the graph
  const assembly = assembleGraph(query, prefix, prunedGraph);

  return assembly;
};

const createGeojson = (name: string, features: Feature[]): object => {
  return {
    type: 'FeatureCollection',
    name: name,
    features: features,
  };
};

const getFilteredData = (prefix: string) => ({
  ...data,
  features: data.features.filter((feature: any) => {
    return feature.properties.postnummer.startsWith(prefix);
  }),
});

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const features: Feature[] = [];

// Create the zero-level polygons
digits.forEach((zero) => {
  features.push(...discard(`xxxx`, zero));

  digits.forEach((one) => {
    features.push(...discard(`${zero}xxx`, `${zero}${one}`));

    digits.forEach((two) => {
      features.push(...discard(`${zero}${one}xx`, `${zero}${one}${two}`));
    });
  });
});

fs.writeFileSync(
  `${__dirname}/../public/clustered.json`,
  JSON.stringify(createGeojson('postnummer', features), null, 2)
);
