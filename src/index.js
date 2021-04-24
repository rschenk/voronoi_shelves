import initializeInterface from './interface.js'
import generateVoronoi from './generate_voronoi.js'
import nodeEdgeShelf from './node_edge_shelf.js'
import { inch } from './units.js'

/*
 * TODO
 * - [x] Separately parameterize shelf & connector thickness
 * - [ ] Add in real units
 * - [x] Automagically scale design to fit in window
 * - [ ] Outline the single-stroke font
 */

const w = 400
const h = 600

const _cardboardThickness = inch(0.15)

const shelfMaterialThickness = 8
const connectorMaterialThickness = shelfMaterialThickness

const voronoiParams = {
  numPoints: 6,
  numRelaxIterations: 1,
  minCellRadius: 80
}

const connectorParams = {
  armLength: shelfMaterialThickness * 6,
  materialThickness: shelfMaterialThickness,
  coreRadius: shelfMaterialThickness * 2,
  armThickness: shelfMaterialThickness * 4
}

const shelfParams = {
  depth: 80,
  materialThickness: connectorMaterialThickness,
  notchLength: connectorMaterialThickness,
  connectorCoreRadius: connectorParams.coreRadius
}

const { context, paper } = initializeInterface(
  w, h,
  { initializePaper: true, darkMode: false }
)

const voronoiDiagram = generateVoronoi(context, w, h, voronoiParams)

nodeEdgeShelf.setPaper(paper)
nodeEdgeShelf.crank(voronoiDiagram, connectorParams, shelfParams)
