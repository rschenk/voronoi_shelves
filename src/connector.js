import { stylesLight, _stylesDark } from './paper_styles.js'

const styles = stylesLight
let paper

export function setPaper (ppr) {
  paper = ppr
}

export function draw (rootCoords, angles, {
  materialThickness = 15,
  armLength = 150,
  coreRadius = null,
  armThickness = null
}) {
  coreRadius = coreRadius || materialThickness * 3
  armThickness = armThickness || materialThickness * 4
  const cornerRadius = (armThickness - materialThickness) / 2

  const sortedAngles = angles.sort((a, b) => a - b)

  const arms = sortedAngles
    .map(angle => drawArm(rootCoords, angle, armLength, armThickness))

  const armSpecs = arms.map(arm => {
    const ccwPoint = arm.segments[1].point
    const cwPoint = arm.segments[2].point

    const ccwEdge = arm.curves[0]
    const cwEdge = arm.curves[2]

    return { ccwPoint, ccwEdge, cwPoint, cwEdge }
  })

  const metaArms = new paper.Path({ insert: false, closed: true })
  armSpecs.forEach((armSpec, i) => {
    const handleScaleFactor = 0.8
    const { ccwPoint, ccwEdge, cwPoint, cwEdge } = armSpec
    const ccwArmSpec = _wrapArray(armSpecs, i - 1)
    const cwArmSpec = _wrapArray(armSpecs, i + 1)

    const ccwIntersection = ccwEdge.getIntersections(ccwArmSpec.cwEdge)[0]
    const cwIntersection = cwEdge.getIntersections(cwArmSpec.ccwEdge)[0]

    const handleFallbackV = cwPoint.subtract(ccwPoint).normalize(armLength * 1.2).rotate(90)

    const ccwHandleV = ccwIntersection ? ccwIntersection.point.subtract(ccwPoint).multiply(handleScaleFactor) : handleFallbackV

    const cwHandleV = cwIntersection ? cwIntersection.point.subtract(cwPoint).multiply(handleScaleFactor) : handleFallbackV

    metaArms.add(new paper.Segment({
      point: ccwPoint,
      handleIn: ccwHandleV
    }))

    metaArms.add(new paper.Segment({
      point: cwPoint,
      handleOut: cwHandleV
    }))
  })

  // Round corners
  const originalCorners = metaArms.segments.slice(0)
  const originalCurves = metaArms.curves.slice(0)

  originalCurves.forEach(curve => {
    const newEnd = curve.divideAt(curve.length - cornerRadius)
    const _newMiddle = curve.divideAt(cornerRadius)

    if (curve.hasHandles()) {
      curve.handle2.length = cornerRadius / 2
    } else {
      curve.handle2 = curve.point1.subtract(curve.point2).normalize(cornerRadius / 2)
    }

    if (newEnd.hasHandles()) {
      newEnd.handle1.length = cornerRadius / 2
    } else {
      newEnd.handle1 = curve.point2.subtract(curve.point1).normalize(cornerRadius / 2)
    }
  })

  originalCorners.forEach(seg => seg.remove())

  const cutouts = sortedAngles
    .map(angle => drawCutout(rootCoords, angle, armLength, materialThickness, coreRadius))

  // Subtract the cutouts from metaArms
  const clippedMetaArm = cutouts.reduce(
    (accumulatedPath, cutout) => accumulatedPath.subtract(cutout, { insert: false }),
    metaArms
  )

  clippedMetaArm.fullySelected = false
  const _finalPath = paper.project.activeLayer.addChild(clippedMetaArm);

  [...arms, ...cutouts].forEach(path => { path.remove() })
}

function drawArm (rootCoords, angle, armLength, armThickness) {
  return _drawArm(rootCoords, angle, armLength, armThickness, 0)
}

function drawCutout (rootCoords, angle, armLength, armThickness, coreRadius) {
  return _drawArm(rootCoords, angle, armLength, armThickness, coreRadius)
}

function _drawArm (rootCoords, angle, armLength, armThickness, coreRadius) {
  const arm = new paper.Path.Rectangle({
    point: [0, 0],
    size: [armThickness, armLength]
  })
  arm.bounds.bottomCenter = new paper.Point(rootCoords).subtract([0, coreRadius])
  arm.rotate(angle, rootCoords)
  arm.style = styles.debug
  return arm
}

// Wraps around an array, i.e. lets you index -1, etc
function _wrapArray (array, i) {
  return array[(i % array.length + array.length) % array.length]
}
