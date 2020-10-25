const FILE = '07';

const input = require(`./${FILE}.json`);
const fs = require('fs');

const { features } = input;

const key = (arr) => arr.map(String).join(',');

const allVertices = [];
const polygons = [];

// step 1
features.forEach(({ geometry: { coordinates } }) => {
  allVertices.push(...coordinates[0]);
  polygons.push(coordinates[0]);
});

// step 2
const vertexCounts = {};
const vertexOwners = {};
polygons.forEach((polygon, polygonId) => {
  polygon.forEach((v) => {
    const k = key(v);
    vertexCounts[k] = (vertexCounts[k] || 0) + 1;
    if (!vertexOwners[k]) {
      vertexOwners[k] = new Set();
    }
    vertexOwners[k].add(polygonId);
  });
});

// Step 3
const sortedEdge = (start, end) => {
  return [start, end].sort((a, b) => {
    return key(a).localeCompare(key(b));
  });
};

const edges = {};
const edgeKey = (vertexA, vertexB) => {
  return [key(vertexA), key(vertexB)].join(' -> ');
};

allVertices.forEach((vertex, i, arr) => {
  const edge = sortedEdge(vertex, arr[(i + 1) % arr.length]);

  const [start, end] = edge;
  const startOwners = vertexOwners[key(start)];
  const endOwners = vertexOwners[key(end)];

  const count = startOwners.size === 2 && endOwners.size === 2 ? 2 : 1;

  edges[edgeKey(start, end)] = {
    count,
    owners: [...new Set([...startOwners, ...endOwners])],
  };
});

console.table(edges);

// Step 4
const getStartVertex = () => {
  for (let i = 0; i < polygons.length; i += 1) {
    const polygon = polygons[i];
    for (let j = 0; j < polygon.length; j += 1) {
      const vertex = polygon[j];
      const owners = vertexOwners[key(vertex)];
      if (owners.size === 1) {
        return [i, j, vertex];
      }
    }
  }
  throw new Error('Could not find a start vertex');
};

const getPolygonId = (id) => {
  return input.features[id].properties.postnummer;
};

const [startPolygonId, startVertexId] = getStartVertex();
let currentPolygonId = startPolygonId;
let currentVertexId = startVertexId;
let direction = 1;

const output = [polygons[startPolygonId][startVertexId]];

const processed = {};

do {
  console.log();
  console.log('======');
  console.log(
    `currentPolygonId: ${currentPolygonId} (${getPolygonId(currentPolygonId)})`
  );
  console.log(`currentVertexId: ${currentVertexId}`);
  console.log(`direction: ${direction}`);
  console.log();

  const polygon = polygons[currentPolygonId];
  const incrementedIndex =
    (currentVertexId + direction + polygon.length) % polygon.length;

  const startVertex = polygon[currentVertexId];
  const nextVertex = polygon[incrementedIndex];
  const edge = sortedEdge(startVertex, nextVertex);
  console.log(`startVertex: ${startVertex}`);
  console.log(`nextVertex: ${nextVertex}`);
  console.log(`edge: ${edgeKey(...edge)}`);

  const loopId = `${edgeKey(...edge)}`;
  if (processed[loopId]) {
    console.log('-----------');
    Object.entries(processed).forEach(([key, polyId], iteration) => {
      console.log(`${key}\t${polyId}\t# ${iteration}`);
    });
    console.log('-----------');
    console.error(`Loop detected: ${loopId}`);
    process.exit(1);
  }
  processed[loopId] = getPolygonId(currentPolygonId);

  if (key(startVertex) === key(nextVertex)) {
    // These are identical -- it's a loop being closed. Jump!
    console.log('Skipping because a loop was detected');
    currentVertexId = incrementedIndex;
    continue;
  }

  const edgeInfo = edges[edgeKey(edge[0], edge[1])];
  const { count } = edgeInfo;
  if (count === 1) {
    console.log(
      `${edgeKey(...edge)} is not shared -- pushing destination ${nextVertex}`
    );
    // This edge is *not* shared -- emit the destination.
    output.push(nextVertex);
    // Advance the pointer to the next vertex.
    currentVertexId = incrementedIndex;
  } else if (count === 2) {
    console.log(`${edgeKey(...edge)} is shared`);
    // This edge is shared. If we proceed along this edge, then we'll be exiting
    // the perimeter. Therefore, we need to follow the other branch so that we
    // stay on the outside of the geometry.

    // If this *edge* is shared, then that means that both vertices are shared,
    // and shared by the same two polygons. Here we want to find the *other*
    // owner so that we can hop and start tracking the new polygon.
    const owners = vertexOwners[key(startVertex)];
    console.log(`${edgeKey(...edge)} is owned by: ${[...owners]}`);
    const [otherOwner] = [...owners].filter((id) => id !== currentPolygonId);
    console.log(`Selected ${otherOwner} to use for traversal`);
    if (otherOwner === undefined) {
      throw new Error('Could not find the new owner -- wat');
    }
    const nextPolygon = polygons[otherOwner];

    // Now that we know what the next owner is, we need to find the "start"
    // vertex in *that* polygon so that we pick up where we left off.
    const nextPolygonVertexId = nextPolygon.findIndex((vertex) => {
      return key(vertex) === key(startVertex);
    });
    console.log(`Found start (${startVertex}) @ ${nextPolygonVertexId}`);
    if (nextPolygonVertexId === -1) {
      throw new Error(
        `Could not locate start index in the new polygon (${otherOwner})`
      );
    }

    // Now we need to see if the polygon was defined in a convenient direction
    // for us. If not, then we'll need to invert the direction.
    const nextVertexId =
      (nextPolygonVertexId + direction + nextPolygon.length) %
      nextPolygon.length;
    const previewStartVertex = nextPolygon[nextPolygonVertexId];
    const previewNextVertex = nextPolygon[nextVertexId];
    const nextEdge = sortedEdge(previewStartVertex, previewNextVertex);
    console.log(`Now:`);
    console.log(`  edge: ${edgeKey(...edge)}`);
    console.log(`Preview:`);
    console.log(`  currentPolygonId: ${otherOwner}`);
    console.log(`  currentVertexId: ${nextPolygonVertexId}`);
    console.log(`  startVertex: ${previewStartVertex}`);
    console.log(`  nextVertex: ${previewNextVertex}`);
    console.log(`  edge: ${edgeKey(...nextEdge)}`);
    if (false) {
      console.log(`Inverting the direction`);
      // This is the same edge -- the other polygon is defined in an inverse
      // order from the current one. This means that we need to flip the order
      // of traversal.
      direction *= -1;
    }

    // Finally, update everything and move on!
    console.log(
      `Jumped from ${currentPolygonId} @ ${currentVertexId} to ${otherOwner} @ ${nextPolygonVertexId}`
    );
    currentPolygonId = otherOwner;
    currentVertexId = nextPolygonVertexId;
  } else {
    throw new Error('WAT');
  }
} while (
  currentPolygonId !== startPolygonId ||
  currentVertexId !== startVertexId
);
console.log(
  `Done: ${currentPolygonId} !== ${startPolygonId} && ${currentVertexId} !== ${startVertexId}`
);

const geojson = {
  type: 'FeatureCollection',
  name: '079',
  features: [
    {
      type: 'Feature',
      properties: {
        postnummer: '079x',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [output],
      },
    },
  ],
};

fs.writeFileSync(
  `${__dirname}/../public/${FILE}-mega.json`,
  JSON.stringify(geojson, null, 2)
);
