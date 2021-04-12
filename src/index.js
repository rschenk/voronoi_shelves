import initializeInterface from './interface.js'
import generateVoronoi from './generate_voronoi.js'
import * as Connector from './connector.js'
import { inch } from './units.js'

const w = 400
const h = 600

const cardboardThickness = inch(0.15)

const connectorParams = {
  armLength: inch(5 / 8),
  materialThickness: cardboardThickness,
  coreRadius: cardboardThickness,
  armThickness: cardboardThickness * 4
}

const voronoiParams = {
  numPoints: 60,
  numRelaxIterations: 2,
  minCellRadius: 60
}

const { canvas, context, paper } = initializeInterface(
  w, h,
  { initializePaper: false, darkMode: false }
)

// Connector.setPaper(paper)
//
// Connector.draw(
//   [w / 2, 160],
//   [0, 120, 240],
//   connectorParams
// )
//
// Connector.draw(
//   [w / 2, h - 160],
//   [0, 120],
//   connectorParams
// )

generateVoronoi(context, w, h, voronoiParams)
