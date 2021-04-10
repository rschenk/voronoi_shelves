import initializeInterface from './interface.js'
import generateVoronoi from './generate_voronoi.js'
import { setUpPaper, drawConnector } from './connector.js'

const w = 400
const h = 600

document.querySelector('body').classList.add('dark')

const { canvas, context } = initializeInterface(w, h)

setUpPaper(canvas)

drawConnector(
  [w/2, 160],
  [0, 120, 240]
)

drawConnector(
  [w/2, h-160],
  [45, 180, 250]
)

generateVoronoi(context, w, h)
