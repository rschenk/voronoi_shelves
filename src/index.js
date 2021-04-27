import initializeInterface from './interface.js'
import generateVoronoi from './generate_voronoi.js'
import nodeEdgeShelf from './node_edge_shelf.js'
import { inch, mm } from './units.js'

/*
 * TODO
 * - [x] Separately parameterize shelf & connector thickness
 * - [x] Add in real units
 * - [x] Automagically scale design to fit in window
 * - [ ] Outline the single-stroke font
 * - [x] Schematic view
 */

const w = inch(15)
const h = inch(15)

const _cardboardThickness = inch(0.15)
const balticBrichThickness = mm(2.9)
const mediumDraftBoardThickness = mm(3.13)

const shelfMaterialThickness = mediumDraftBoardThickness
const connectorMaterialThickness = balticBrichThickness

const voronoiParams = {
  numPoints: 20,
  numRelaxIterations: 1,
  minCellRadius: inch(1.55)
}

const connectorParams = {
  armLength: shelfMaterialThickness * 6,
  materialThickness: shelfMaterialThickness,
  coreRadius: shelfMaterialThickness * 2,
  armThickness: shelfMaterialThickness * 4
}

const shelfParams = {
  depth: inch(2),
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
