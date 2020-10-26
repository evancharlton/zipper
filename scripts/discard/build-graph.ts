import { makeId } from './ids';
import { table } from './logging';
import { Graph, Polygon, Vertex } from './types';

export default (features: any[]): Graph => {
  const polygons: { [index: number]: Polygon } = {};
  const graph: Graph = {};

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
  return graph;
};
