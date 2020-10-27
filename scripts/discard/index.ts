import assembleGraph from './assemble-graph';
import buildEdges from './build-edges';
import buildGraph from './build-graph';
import findSharedEdges from './find-shared-edges';
import pruneGraph from './prune-graph';
import { CoordinateList } from './types';
import fs from 'fs';

const data = require(`${__dirname}/../../data/postnummer.min.json`);

const discard = (query: string, prefix: string): CoordinateList[] => {
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
  return assembleGraph(prunedGraph);
};

const getFilteredData = (prefix: string) => ({
  ...data,
  features: data.features.filter((feature: any) => {
    return feature.properties.postnummer.startsWith(prefix);
  }),
});

type DataPayload = { [query: string]: CoordinateList[] };

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const payloads: DataPayload[] = [{}, {}, {}, {}, {}];

digits.forEach((zero) => {
  const q0 = 'xxxx';
  payloads[0][q0] = (payloads[0][q0] ?? []).concat(discard(q0, zero));

  digits.forEach((one) => {
    const q1 = `${zero}xxx`;
    payloads[1][q1] = (payloads[1][q1] ?? []).concat(
      discard(q1, `${zero}${one}`)
    );

    digits.forEach((two) => {
      const q2 = `${zero}${one}xx`;
      payloads[2][q2] = (payloads[2][q2] ?? []).concat(
        discard(q2, `${zero}${one}${two}`)
      );

      digits.forEach((three) => {
        const q3 = `${zero}${one}${two}x`;
        const polys = discard(q3, `${zero}${one}${two}${three}`);
        payloads[3][q3] = (payloads[3][q3] ?? []).concat(polys);

        const q4 = `${zero}${one}${two}${three}`;
        payloads[4][q4] = polys;
      });
    });
  });
});

payloads.forEach((payload, i) => {
  fs.writeFileSync(
    `${__dirname}/../../public/clustered-${i}.json`,
    JSON.stringify(payload)
  );
});
