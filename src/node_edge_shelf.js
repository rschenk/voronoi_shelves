import { getStyles } from './paper_styles.js'
import * as Connector from './connector.js'

const styles = getStyles()
let paper

function setPaper (ppr) {
  paper = ppr
  Connector.setPaper(paper)
}

function crank (voronoiDiagram, connectorParams) {
  // Set an ID for vertices
  voronoiDiagram.vertices.forEach((v, i) => { v.vertexId = i })

  // Make our own internal representation of vertices and edges, based on the
  // Voronoi diagram, because we'll be modifying it
  let vertices = voronoiDiagram.vertices.map(({ x, y, vertexId }) => {
    return ({
      point: new paper.Point(x, y),
      id: vertexId
    })
  })

  // Map{vertexId => Vertex}
  const vertIndex = new Map(vertices.map(v => [v.id, v]))

  const edges = voronoiDiagram.edges.map(e => {
    const vertA = vertIndex.get(e.va.vertexId)
    const vertB = vertIndex.get(e.vb.vertexId)
    return {
      start: vertA,
      end: vertB
    }
  })

  // Map{vertexId => [Edge, Edge]}
  const edgeIndex = buildEdgeIndex(edges)

  // Remove any vertexes that have no edges (quirk of Voronoi library?)
  vertices = vertices.filter(v => vertexEdges(v, edgeIndex).length > 0)

  // Find all vertexes that have a single edge, positioned on top of another
  // vertex. This is a quirk of how the Voronoi library builds the outer edges
  const singleEdgeVertices = vertices
    .filter(v => vertexEdges(v, edgeIndex).length === 1)

  // Find the vertex that the single edge should be collapsed into, which will
  // be right on top of it
  singleEdgeVertices.map(singleEdgeVertex => {
    const seekDistanceSq = 0.5
    const nearbyVertex = vertices
      .filter(v => v.id !== singleEdgeVertex.id)
      .find(v => v.point.getDistance(singleEdgeVertex.point, true) < seekDistanceSq)

    const edge = vertexEdges(singleEdgeVertex, edgeIndex)[0]

    return { singleEdgeVertex, edge, nearbyVertex }
  }).forEach(({ singleEdgeVertex, edge, nearbyVertex }) => {
    // Re-assign the edge from the single vertex, to the nearby one
    if (edge.start.id === singleEdgeVertex.id) {
      edge.start = nearbyVertex
    } else {
      edge.end = nearbyVertex
    }

    // Add this edge to the index
    edgeIndex.get(nearbyVertex.id).add(edge)

    // Remove the single edge vertex from edge index, vert index, and vertices list
    edgeIndex.delete(singleEdgeVertex.id)
    vertIndex.delete(singleEdgeVertex.id)
    vertices.splice(
      vertices.indexOf(singleEdgeVertex),
      1
    )
  })

  // renderConnectors(vertices, vertIndex, edges, edgeIndex, connectorParams)

  renderPreview(vertices, vertIndex, edges, edgeIndex, connectorParams)
}

function renderConnectors (vertices, vertIndex, _edges, edgeIndex, connectorParams) {
  const padding = 10
  let accumulator = padding

  vertices.forEach(v => {
    if (!edgeIndex.has(v.id)) { return }

    const selectedVertex = vertIndex.get(v.id)
    const selectedEdges = Array.from(edgeIndex.get(v.id))
    const selectedAngles = calculateEdgeAngles(selectedVertex, selectedEdges)

    const connector = Connector.draw(
      [0, 0],
      selectedAngles,
      v.id.toString(),
      connectorParams
    )

    connector.bounds.topLeft = [connectorParams.armLength, accumulator]

    accumulator += connector.bounds.height + padding
  })
}

function renderPreview (vertices, vertIndex, edges, edgeIndex, connectorParams) {
// Draw edges
  edges.forEach(({ start, end }) => {
    const _ = new paper.Path({
      segments: [start, end],
      style: styles.debug
    })
  })

  vertices.forEach(v => {
    if (!edgeIndex.has(v.id)) { return }

    const selectedVertex = vertIndex.get(v.id)
    const selectedEdges = Array.from(edgeIndex.get(v.id))
    const selectedAngles = calculateEdgeAngles(selectedVertex, selectedEdges)

    // const _ = new paper.Path.Circle({
    //   center: selectedVertex.point,
    //   radius: 2,
    //   style: styles.red
    // })

    Connector.draw(
      selectedVertex.point,
      selectedAngles,
      v.id.toString(),
      connectorParams
    )
  })
}

// returns Map vertexId => [Edge, Edge]
function buildEdgeIndex (edges) {
  const edgeIndex = new Map()

  edges.forEach(e => {
    const { start, end } = e
    const startId = start.id
    const endId = end.id

    if (!edgeIndex.has(startId)) { edgeIndex.set(startId, new Set()) }
    if (!edgeIndex.has(endId)) { edgeIndex.set(endId, new Set()) }

    edgeIndex.get(startId).add(e)
    edgeIndex.get(endId).add(e)
  })

  return edgeIndex
}

function vertexEdges (vertex, edgeIndex) {
  return Array.from(edgeIndex.get(vertex.id) || [])
}

function calculateEdgeAngles (vertex, edges) {
  return edges.map(({ start, end }) => {
    let p1, p2
    if (start.id === vertex.id) {
      p1 = start.point
      p2 = end.point
    } else {
      p1 = end.point
      p2 = start.point
    }

    // The +90 bit is because paperjs' angle function defines 0deg as the X-axis
    // whereas the Connector code devices 0deg as North
    return p2.subtract(p1).angle + 90
  })
}

export default {
  setPaper, crank
}
