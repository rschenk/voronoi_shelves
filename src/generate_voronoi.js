import Voronoi from 'voronoi'
import { polygonCentroid } from 'd3-polygon'
import polylabel from 'polylabel'

// TODO all of the below variables are shared state between functions. Would be
// great to clean that up
let points = []
let centers = []

let diagram
const voronoi = new Voronoi()
let smallestCenter
let voronoiBounds

export default function generateVoronoi (context, w, h, {
  numPoints = 50,
  numRelaxIterations = 1,
  minCellRadius = 40
}) {
  voronoiBounds = { xl: 0, yt: 0, xr: w - 0, yb: h - 0 }
  points = generatePoints(numPoints, w, h)
  diagram = voronoi.compute(points, voronoiBounds)

  do {
    const relaxation = relax(numRelaxIterations, diagram)
    diagram = relaxation.diagram
    points = relaxation.points

    centers = calculateCenters(diagram)
    smallestCenter = findSmallestCenter(centers)

    const { distance, voronoiId } = smallestCenter

    if (distance < minCellRadius) {
      points.splice(voronoiId, 1)
      voronoi.recycle(diagram)
      diagram = voronoi.compute(points, voronoiBounds)
    }
  } while (smallestCenter.distance < minCellRadius)

  render(context, diagram, w, h, minCellRadius)
  return diagram
}

function relax (numRelaxIterations, diagram) {
  let newPoints
  for (let i = 0; i < numRelaxIterations; i++) {
    newPoints = lloydsRelaxation(diagram)
    voronoi.recycle(diagram)
    diagram = voronoi.compute(newPoints, voronoiBounds)
  }

  return { diagram, points: newPoints }
}

// Polylabel calculates the point farthest from any edge
function calculateCenters (diagram) {
  return diagram.cells.map(cell => {
    const polygon = cellPolygon(cell)
    const center = polylabel([polygon], 1.0)
    center.voronoiId = cell.site.voronoiId
    return center
  })
}

function findSmallestCenter (centers) {
  return centers.reduce(
    (acc, ctr) => {
      if (ctr.distance < acc.distance) {
        return { distance: ctr.distance, voronoiId: ctr.voronoiId }
      } else {
        return acc
      }
    }, { voronoiId: 0, distance: Number.MAX_VALUE }
  )
}

function generatePoints (num, w, h) {
  return new Array(num).fill(null).map(_ => {
    return {
      x: Math.floor(Math.random() * Math.floor(w)),
      y: Math.floor(Math.random() * Math.floor(h))
    }
  })
}

function render (context, diagram, w, h, minCellRadius) {
  context.clearRect(0, 0, w, h)

  centers.forEach(([x, y]) => {
    context.beginPath()
    context.strokeStyle = '#ccc'
    context.arc(x, y, minCellRadius, 0, Math.PI * 2, true)
    context.closePath()
    context.stroke()
  })

  points.forEach(({ x, y }) => {
    context.beginPath()
    context.fillStyle = '#000'
    context.arc(x, y, 2, 0, Math.PI * 2, true)
    context.closePath()
    context.fill()
  })

  // centroids
  diagram.cells.forEach(cell => {
    const [centX, centY] = cellCentroid(cell)
    context.beginPath()
    context.strokeStyle = '#000'
    context.moveTo(cell.site.x, cell.site.y)
    context.lineTo(centX, centY)
    context.closePath()
    context.stroke()
  })

  diagram.edges.forEach(({ va, vb }) => {
    if (!va || !vb) { return }
    context.beginPath()
    context.strokeStyle = '#000'
    context.moveTo(va.x, va.y)
    context.lineTo(vb.x, vb.y)
    context.closePath()
    context.stroke()
  })

  diagram.vertices.forEach(({ x, y }) => {
    context.beginPath()
    context.fillStyle = 'red'
    context.arc(x, y, 5, 0, Math.PI * 2, true)
    context.closePath()
    context.fill()
  })
}

function lloydsRelaxation (diagram) {
  const omega = 1 // A scale factor for making relaxation faster or slower

  const newPoints = []

  diagram.cells.forEach(cell => {
    const { x: x0, y: y0 } = cell.site

    const [x1, y1] = cellCentroid(cell)

    newPoints.push({
      x: x0 + ((x1 - x0) * omega),
      y: y0 + ((y1 - y0) * omega)
    })
  })

  return newPoints
}

// Maps a Voronoi.Cell to a simple polyline
function cellPolygon (voronoiCell) {
  return voronoiCell
    .halfedges
    .map(ha => ha.getStartpoint())
    .map(({ x, y }) => [x, y])
}

function cellCentroid (voronoiCell) {
  return polygonCentroid(
    cellPolygon(voronoiCell)
  )
}
