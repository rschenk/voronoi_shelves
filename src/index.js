import initializeInterface from './interface.js'
import generateVoronoi from './generate_voronoi.js'
import nodeEdgeShelf from './node_edge_shelf.js'
import { inch } from './units.js'

const w = 400
const h = 600

const _cardboardThickness = inch(0.15)
const materialThickness = 8

const voronoiParams = {
  numPoints: 4,
  numRelaxIterations: 5,
  minCellRadius: 80
}

const connectorParams = {
  armLength: 40,
  materialThickness: materialThickness,
  coreRadius: materialThickness * 2,
  armThickness: materialThickness * 4
}

const { context, paper } = initializeInterface(
  w, h,
  { initializePaper: true, darkMode: true }
)

const voronoiDiagram = generateVoronoi(context, w, h, voronoiParams)

nodeEdgeShelf.setPaper(paper)
nodeEdgeShelf.crank(voronoiDiagram, connectorParams)
