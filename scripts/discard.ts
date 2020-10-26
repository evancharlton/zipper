const fs = require('fs');
const v8 = require('v8');

const data = require(`${__dirname}/../public/postnummer.min.json`);

const log = (...args: any[]): void => {
  // console.log(...args);
};

const table = (...args: any[]): void => {
  // console.table(...args);
};

let globalFeatureCounter = 0;

type CoordinateList = [number, number][];

type Feature = {
  type: 'Feature';
  properties: {
    postnummer: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: [CoordinateList];
  };
};

type Vertex = {
  x: number;
  y: number;
  neighbors: Set<string>; // xy
  polygonIds: Set<number>; // polygons which own this
};

const isVertex = (item: unknown): item is Vertex => {
  return !!(item as Vertex).neighbors;
};

type Edge = {
  startVertexId: string;
  endVertexId: string;
  polygonIds: Set<number>;
};

const isEdge = (item: unknown): item is Edge => {
  return !!(item as Edge).polygonIds;
};

type Polygon = {
  postnummer: string;
  index: number;
};

const isPolygon = (item: unknown): item is Polygon => {
  return !!(item as Polygon).postnummer;
};

const makeEdgeId = (a: string, b: string): string => {
  return [a, b].sort().join(' -> ');
};

const makeId = (item: Vertex | Polygon | Edge | number[]): string => {
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

const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const i = new Set<T>();
  a.forEach((v) => {
    if (b.has(v)) {
      i.add(v);
    }
  });
  return i;
};

const discard = (query: string, prefix: string): Feature[] => {
  console.log(`Beginning ${query} / ${prefix} ...`);
  const { features } = getFilteredData(prefix);

  if (features.length === 0) {
    return [];
  }

  // Step 1: Build the graph

  const polygons: { [index: number]: Polygon } = {};

  const graph: { [xy: string]: Vertex } = {};

  features.forEach(
    (
      { geometry: { coordinates }, properties: { postnummer } }: any,
      polygonIndex: number
    ) => {
      // Create a polygon record
      const polygon: Polygon = {
        postnummer,
        index: polygonIndex,
      };
      polygons[polygonIndex] = polygon;

      // Populate the shared all-vertexes list since we're building a giant
      // merged graph.
      const coords: number[][] = coordinates[0];
      coords.forEach(([x, y]: number[], i: number) => {
        const vertexId = `${x},${y}`;
        const vertex: Vertex = graph[vertexId] ?? {
          x,
          y,
          neighbors: new Set(),
          polygonIds: new Set(),
        };

        vertex.polygonIds.add(polygonIndex);

        // Link them with previous & next
        if (i > 0) {
          const previousCoords =
            coords[(i - 1 + coords.length) % coords.length];
          const previousVertexId = makeId(previousCoords);
          const previousVertex = graph[previousVertexId];
          previousVertex.neighbors.add(vertexId);
          vertex.neighbors.add(previousVertexId);
        }

        graph[vertexId] = vertex;
      });
    }
  );

  table(graph);

  // Step 2: Build the edges between all of the vertexes
  const edges: { [xyxy: string]: Edge } = {};
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

  // Step 3: Find the shared edges. If an edge is shared, then it can be removed
  // from the graph entirely.
  const sharedEdges: { [xyxy: string]: Edge } = {};
  Object.entries(edges).forEach(([edgeId, edge]) => {
    if (edge.polygonIds.size > 1) {
      sharedEdges[edgeId] = edge;
    }
  });

  table(sharedEdges);

  // Step 4: Remove them from the graph
  const prunedGraph: { [xy: string]: Vertex } = v8.deserialize(
    v8.serialize(graph)
  );
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

  // Step 5: Reassemble the graph
  const createdFeatures: Feature[] = [];
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
      createdFeatures.push(
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

  // Push the final one just to complete the loop
  coordinateList.push(coordinateList[0]);

  table(coordinateList);

  return createdFeatures;
};

const createFeature = (
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
// .concat(
//   digits.reduce((f, zero) => {
//     return [
//       ...f,
//       ...digits.reduce((acc, prefix) => {
//         return [...acc, ...discard(`${zero}xxx`, getFilteredData(prefix))];
//       }, [] as Feature[]),
//     ];
//   }, [] as Feature[])
// );

fs.writeFileSync(
  `${__dirname}/../public/data.min.json`,
  JSON.stringify(createGeojson('postnummer', features))
);
