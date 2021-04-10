import { Delaunay } from 'd3-delaunay'
import { polygonCentroid } from 'd3-polygon'
import polylabel from 'polylabel'

const numPoints = 50
const numRelaxIterations = 1
const minCellRadius = 40

// TODO all of the below variables are shared state between function. Would be
// great to clean that up
let points = []
let centers = new Array(numPoints).fill(null)

let delaunay
let voronoi
let smallestCenter
let voronoiBounds

export default function generateVoronoi (context, w, h) {
  voronoiBounds = [0, 0, w, h]
  points = generatePoints(numPoints, w, h)
  delaunay = Delaunay.from(points)
  voronoi = delaunay.voronoi(voronoiBounds)

  do {
    relax()
    // Polylabel calculates the point farthest from any edge
    centers = calculateCenters(points, voronoi)
    smallestCenter = findSmallestCenter(centers)

    const { distance, i } = smallestCenter

    if (distance < minCellRadius) {
      points.splice(i, 1)
      delaunay = Delaunay.from(points)
      voronoi = delaunay.voronoi(voronoiBounds)
    }
  } while (smallestCenter.distance < minCellRadius)

  render(context, voronoi, w, h)
}

function relax () { // Uses/modifies global state
// Relax the voronoi a few times
  for (let i = 0; i < numRelaxIterations; i++) {
    lloydsRelaxation(voronoi, points) // resets the values in `points`
    delaunay = Delaunay.from(points)
    voronoi = delaunay.voronoi(voronoiBounds)
  }
}

// Polylabel calculates the point farthest from any edge
function calculateCenters (points, voronoi) {
  return points
    .map((_p, i) => voronoi.cellPolygon(i))
    .map(polygon => polylabel([polygon], 1.0))
}

function findSmallestCenter (centers) {
  return centers.reduce(
    (acc, ctr, i) => {
      if (ctr.distance < acc.distance) {
        return { distance: ctr.distance, i }
      } else {
        return acc
      }
    },
    { i: 0, distance: Number.MAX_VALUE }
  )
}

function generatePoints (num, w, h) {
  return new Array(num).fill(null).map(_ => [
    Math.floor(Math.random() * Math.floor(w)),
    Math.floor(Math.random() * Math.floor(h))
  ])
}

function render (context, voronoi, w, h) {
  context.clearRect(0, 0, w, h)

  context.beginPath()
  context.strokeStyle = '#000'
  voronoi.render(context)
  context.closePath()
  context.stroke()

  // context.beginPath()
  // context.fillStyle = 'red'
  // voronoi.delaunay.renderPoints(context, 2)
  // context.closePath()
  // context.fill()

  points.forEach((_, i) => {
    const center = centers[i]
    const [x, y] = center
    const isTooSmall = center.distance < minCellRadius

    context.beginPath()
    context.strokeStyle = isTooSmall ? 'red' : '#eee'
    context.arc(x, y, minCellRadius, 0, Math.PI * 2, true)
    context.closePath()
    context.stroke()
  })
}

function lloydsRelaxation (voronoi, points) {
  const omega = 1 // A scale factor for making relaxation faster or slower

  const delaunay = voronoi.delaunay

  for (let i = 0; i < points.length; i++) {
    const cell = voronoi.cellPolygon(i)
    if (cell === null) continue

    const x0 = delaunay.points[i]
    const y0 = delaunay.points[i + 1]

    const [x1, y1] = polygonCentroid(cell)

    points[i][0] = x0 + ((x1 - x0) * omega)
    points[i][1] = y0 + ((y1 - y0) * omega)
  }
}
