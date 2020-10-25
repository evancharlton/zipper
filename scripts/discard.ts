const FILE = '07';

const input = require(`./${FILE}.json`);
const fs = require('fs');
const v8 = require('v8');

const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const i = new Set<T>();
  a.forEach((v) => {
    if (b.has(v)) {
      i.add(v);
    }
  });
  return i;
};

const { features } = input;

type Polygon = {
  postnummer: string;
  index: number;
};

const isPolygon = (item: unknown): item is Polygon => {
  return !!(item as Polygon).postnummer;
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

// Step 1: Build the graph

const polygons: { [index: number]: Polygon } = {};

const graph: { [xy: string]: Vertex } = {};

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
        const previousCoords = coords[(i - 1 + coords.length) % coords.length];
        const previousVertexId = makeId(previousCoords);
        const previousVertex = graph[previousVertexId];
        previousVertex.neighbors.add(vertexId);
        vertex.neighbors.add(previousVertexId);
      }

      graph[vertexId] = vertex;
    });
  }
);

console.table(graph);

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

console.table(edges);

// Step 3: Find the shared edges. If an edge is shared, then it can be removed
// from the graph entirely.
const sharedEdges: { [xyxy: string]: Edge } = {};
Object.entries(edges).forEach(([edgeId, edge]) => {
  if (edge.polygonIds.size > 1) {
    sharedEdges[edgeId] = edge;
  }
});

console.table(sharedEdges);

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

console.table(prunedGraph);

// Step 5: Reassemble the graph
const coordinateList: [number, number][] = [];
const addedVertexes: { [xy: string]: boolean } = {};
// Pick a starting point -- it doesn't matter which one.
const startingKey = Object.keys(prunedGraph)[0];

let currentKey = startingKey;
do {
  console.log(`Processing ${currentKey} ...`);

  const currentVertex = prunedGraph[currentKey];
  coordinateList.push([currentVertex.x, currentVertex.y]);
  addedVertexes[currentKey] = true;
  let nextVertexId: string | undefined = undefined;
  currentVertex.neighbors.forEach((vertexId) => {
    if (nextVertexId) {
      // We already chose one.
      return;
    }
    if (addedVertexes[vertexId]) {
      // We've already processed this one.
      return;
    }
    nextVertexId = vertexId;
  });

  if (nextVertexId === undefined) {
    // We've processed everything!!
    break;
  }

  currentKey = nextVertexId;
} while (currentKey !== startingKey);

// Push the final one just to complete the loop
coordinateList.push(coordinateList[0]);

console.table(coordinateList);

// Step 6: Write the file

let postnummerPattern = FILE;
while (postnummerPattern.length < 4) {
  postnummerPattern += 'x';
}

const geojson = {
  type: 'FeatureCollection',
  name: FILE,
  features: [
    {
      type: 'Feature',
      properties: {
        postnummer: postnummerPattern,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinateList],
      },
    },
  ],
};

fs.writeFileSync(
  `${__dirname}/../public/${postnummerPattern}.json`,
  JSON.stringify(geojson, null, 2)
);
